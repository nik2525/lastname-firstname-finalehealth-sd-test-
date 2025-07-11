import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatIconModule } from "@angular/material/icon"
import { PatientService } from "../../../../shared/services/patient.service"

@Component({
  selector: "app-patient-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="form-container">
      <div class="modern-card">
        <div class="section-header add-patient">
          <h2 class="section-title">{{ isEditMode ? 'Edit Patient' : 'Add New Patient' }}</h2>
          <p class="section-subtitle">{{ isEditMode ? 'Update patient information' : 'Enter patient details to add them to the system' }}</p>
        </div>

        <div class="form-section">
          <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="fill">
                <mat-label>First Name *</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="patientForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Last Name *</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="patientForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Date of Birth *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dob" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="patientForm.get('dob')?.hasError('required')">
                  Date of birth is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="form-field-full">
                <mat-label>Email *</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="patientForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="patientForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="form-field-full">
                <mat-label>Phone Number *</mat-label>
                <input matInput formControlName="phoneNumber" required>
                <mat-error *ngIf="patientForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="form-field-full">
                <mat-label>Address *</mat-label>
                <textarea matInput formControlName="address" rows="3" required></textarea>
                <mat-error *ngIf="patientForm.get('address')?.hasError('required')">
                  Address is required
                </mat-error>
              </mat-form-field>
            </div>

            <div *ngIf="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="patientForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="16" style="margin-right: 8px;"></mat-spinner>
                {{ isEditMode ? 'Update Patient' : 'Add Patient' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup
  isEditMode = false
  patientId: string | null = null
  loading = false
  error: string | null = null

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.patientForm = this.createForm()
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("id")
    this.isEditMode = !!this.patientId

    if (this.isEditMode && this.patientId) {
      this.loadPatient(this.patientId)
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: ["", [Validators.required]],
      dob: ["", [Validators.required]],
      address: ["", [Validators.required]],
    })
  }

  private loadPatient(id: string): void {
    this.loading = true
    this.patientService.getPatient(id).subscribe({
      next: (patient) => {
        this.patientForm.patchValue({
          ...patient,
          dob: new Date(patient.dob),
        })
        this.loading = false
      },
      error: (error) => {
        this.error = "Failed to load patient data."
        this.loading = false
        console.error("Error loading patient:", error)
      },
    })
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.loading = true
      this.error = null

      // Format the date properly before sending to the backend
      const formData = {
        ...this.patientForm.value,
        dob: this.formatDate(this.patientForm.value.dob)
      }

      const operation = this.isEditMode
        ? this.patientService.updatePatient(this.patientId!, formData)
        : this.patientService.createPatient(formData)

      operation.subscribe({
        next: () => {
          this.router.navigate(["/patients"])
        },
        error: (error) => {
          this.error = error.error?.message || `Failed to ${this.isEditMode ? "update" : "create"} patient.`
          this.loading = false
          console.error("Error saving patient:", error)
        },
      })
    }
  }

  // Helper method to format date in YYYY-MM-DD format
  private formatDate(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  onCancel(): void {
    this.router.navigate(["/patients"])
  }
}

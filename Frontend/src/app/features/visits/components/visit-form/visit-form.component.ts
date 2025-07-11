import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatIconModule } from "@angular/material/icon"
import { VisitService } from "../../../../shared/services/visit.service"
import { PatientService } from "../../../../shared/services/patient.service"
import { VisitType, CreateVisitDto, UpdateVisitDto } from "../../../../shared/models/visit.model"
import { Patient } from "../../../../shared/models/patient.model"

// Define a type for API errors
interface ApiError {
  error?: {
    message?: string;
  };
}

@Component({
  selector: "app-visit-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="form-container">
      <div class="modern-card">
        <div class="section-header visits">
          <h2 class="section-title">{{ isEditMode ? 'Edit Visit' : 'Add New Visit' }}</h2>
          <p class="section-subtitle">{{ isEditMode ? 'Update visit information' : 'Record a new patient visit' }}</p>
        </div>

        <div class="form-section">
          <form [formGroup]="visitForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="fill">
                <mat-label>Patient *</mat-label>
                <mat-select formControlName="patientId" required>
                  <mat-option *ngFor="let patient of patients" [value]="patient._id">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="visitForm.get('patientId')?.hasError('required')">
                  Patient is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Visit Date *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="visitDate" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="visitForm.get('visitDate')?.hasError('required')">
                  Visit date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="form-field-full">
                <mat-label>Visit Type *</mat-label>
                <mat-select formControlName="visitType" required>
                  <mat-option *ngFor="let type of visitTypes" [value]="type">
                    {{ type }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="visitForm.get('visitType')?.hasError('required')">
                  Visit type is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="form-field-full">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="4" 
                          placeholder="Enter visit notes..."></textarea>
              </mat-form-field>
            </div>

            <div *ngIf="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="visitForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="16" style="margin-right: 8px;"></mat-spinner>
                {{ isEditMode ? 'Update Visit' : 'Add Visit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class VisitFormComponent implements OnInit {
  visitForm: FormGroup
  patients: Patient[] = []
  visitTypes = Object.values(VisitType)
  isEditMode = false
  visitId: string | null = null
  loading = false
  error: string | null = null

  private fb = inject(FormBuilder);
  private visitService = inject(VisitService);
  private patientService = inject(PatientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  constructor() {
    this.visitForm = this.createForm();
  }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.visitId;

    // Get patient ID from query params if available
    this.route.queryParams.subscribe(params => {
      const patientId = params['patientId'];
      if (patientId) {
        // Set the patient ID in the form
        this.visitForm.patchValue({
          patientId: patientId
        });
        // Disable the patient field since it's pre-filled
        this.visitForm.get('patientId')?.disable();
      }
    });

    if (this.isEditMode && this.visitId) {
      // Load visit will also load patients
      this.loadVisit(this.visitId);
    } else {
      // Only load patients if not in edit mode
      this.loadPatients();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patientId: ["", [Validators.required]],
      visitDate: ["", [Validators.required]],
      visitType: ["", [Validators.required]],
      notes: [""],
    })
  }

  private loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response) => {
        this.patients = response.data
      },
      error: (error) => {
        this.error = "Failed to load patients."
        console.error("Error loading patients:", error)
      },
    })
  }

  private loadVisit(id: string): void {
    this.loading = true;
    this.visitService.getVisitById(id).subscribe({
      next: (visit) => {
        // First, ensure we have the latest patient data
        this.patientService.getPatients().subscribe({
          next: (patientsResponse) => {
            this.patients = Array.isArray(patientsResponse) 
              ? patientsResponse 
              : (patientsResponse.data || []);
            
            // Now patch the form values
            this.visitForm.patchValue({
              patientId: visit.patientId,
              visitDate: new Date(visit.visitDate),
              visitType: visit.visitType,
              notes: visit.notes || '',
            });

            // Disable patient selection in edit mode
            if (this.isEditMode) {
              this.visitForm.get('patientId')?.disable({ emitEvent: false });
            }
            
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load patient data. Please try again.';
            this.loading = false;
            console.error('Error loading patients:', error);
          }
        });
      },
      error: (error) => {
        this.error = 'Failed to load visit details. Please try again.';
        this.loading = false;
        console.error('Error loading visit:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.visitForm.valid) {
      this.loading = true;
      this.error = null;

      try {
        // Get the raw form value to include disabled fields
        const formData = this.visitForm.getRawValue();
        
        // Ensure visitDate is a Date object and in the correct format
        let visitDate: Date;
        if (formData.visitDate instanceof Date) {
          visitDate = formData.visitDate;
        } else if (formData.visitDate) {
          visitDate = new Date(formData.visitDate);
        } else {
          throw new Error('Visit date is required');
        }
        
        if (isNaN(visitDate.getTime())) {
          throw new Error('Invalid visit date');
        }
        
        // Create a new Date object to ensure it's a clean instance
        const normalizedDate = new Date(visitDate);
        
        // Prepare the base data object with proper date formatting
        const baseData = {
          visitDate: normalizedDate, // Use the normalized Date object
          visitType: formData.visitType as VisitType,
          notes: formData.notes?.trim() || undefined
        };

        // Create the appropriate DTO based on whether we're creating or updating
        if (this.isEditMode && this.visitId) {
          const updateData: UpdateVisitDto = {
            ...baseData,
            // Only include patientId if it's being changed (though typically shouldn't change)
            ...(formData.patientId ? { patientId: formData.patientId } : {})
          };
          
          this.visitService.updateVisit(this.visitId, updateData).subscribe({
            next: () => this.router.navigate(['/visits']),
            error: (error) => this.handleError(error, 'update'),
            complete: () => this.loading = false
          });
        } else {
          if (!formData.patientId) {
            throw new Error('Patient ID is required');
          }
          
          const createData: CreateVisitDto = {
            ...baseData,
            patientId: formData.patientId
          };
          
          this.visitService.createVisit(createData).subscribe({
            next: () => this.router.navigate(['/visits']),
            error: (error) => this.handleError(error, 'create'),
            complete: () => this.loading = false
          });
        }
      } catch (error: unknown) {
        // Handle the error properly with type safety
        if (error instanceof Error) {
          const apiError: ApiError = { error: { message: error.message } };
          this.handleError(apiError, this.isEditMode ? 'update' : 'create');
        } else {
          const apiError: ApiError = { error: { message: 'An unknown error occurred' } };
          this.handleError(apiError, this.isEditMode ? 'update' : 'create');
        }
      }
    }
  }
  
  private handleError(error: ApiError | Error | unknown, action: 'create' | 'update'): void {
    let errorMessage = 'An unknown error occurred';
    
    if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      const standardError = error as Error;
      
      if ('error' in apiError && apiError.error && typeof apiError.error === 'object' && 'message' in apiError.error) {
        errorMessage = String(apiError.error.message) || errorMessage;
      } else if ('message' in standardError) {
        errorMessage = String(standardError.message) || errorMessage;
      }
    }
    
    this.error = `Failed to ${action} visit. ${errorMessage}`;
    this.loading = false;
    console.error(`Error ${action}ing visit:`, error);
  }

  onCancel(): void {
    this.router.navigate(['/visits']);
  }
}

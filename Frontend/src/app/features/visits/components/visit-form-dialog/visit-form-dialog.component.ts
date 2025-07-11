import { Component, Inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { type FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import type { MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { type Visit, VisitType } from "../../../../shared/models/visit.model"
import type { VisitService } from "../../../../shared/services/visit.service"
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog" // Added import for MatDialogModule

interface DialogData {
  patientId: string
  visit: Visit | null
  isEdit: boolean
}

@Component({
  selector: "app-visit-form-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Visit' : 'Add New Visit' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="visitForm">
        <mat-form-field class="form-field">
          <mat-label>Visit Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="visitDate" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="visitForm.get('visitDate')?.hasError('required')">
            Visit date is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field">
          <mat-label>Visit Type</mat-label>
          <mat-select formControlName="visitType" required>
            <mat-option *ngFor="let type of visitTypes" [value]="type">
              {{ type }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="visitForm.get('visitType')?.hasError('required')">
            Visit type is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="form-field">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="4" 
                    placeholder="Enter visit notes..."></textarea>
        </mat-form-field>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="visitForm.invalid || loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        {{ data.isEdit ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    .form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
  `,
  ],
})
export class VisitFormDialogComponent implements OnInit {
  visitForm: FormGroup
  visitTypes = Object.values(VisitType)
  loading = false
  error: string | null = null
  data: any

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private dialogRef: MatDialogRef<VisitFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) MAT_DIALOG_DATA: any, // Updated injection decorator
  ) {
    this.data = MAT_DIALOG_DATA
    this.visitForm = this.createForm()
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.visit) {
      this.visitForm.patchValue({
        visitDate: new Date(this.data.visit.visitDate),
        visitType: this.data.visit.visitType,
        notes: this.data.visit.notes || "",
      })
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      visitDate: ["", [Validators.required]],
      visitType: ["", [Validators.required]],
      notes: [""],
    })
  }

  onSave(): void {
    if (this.visitForm.valid) {
      this.loading = true
      this.error = null

      const formData = {
        ...this.visitForm.value,
        patientId: this.data.patientId,
      }

      const operation = this.data.isEdit
        ? this.visitService.updateVisit(this.data.visit!._id!, formData)
        : this.visitService.createVisit(this.data.patientId, formData)

      operation.subscribe({
        next: () => {
          this.dialogRef.close(true)
        },
        error: (error) => {
          this.error = `Failed to ${this.data.isEdit ? "update" : "create"} visit.`
          this.loading = false
          console.error("Error saving visit:", error)
        },
      })
    }
  }

  onCancel(): void {
    this.dialogRef.close(false)
  }
}

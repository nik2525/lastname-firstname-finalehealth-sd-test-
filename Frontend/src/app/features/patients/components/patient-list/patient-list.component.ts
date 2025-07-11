import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator"
import { Subject, BehaviorSubject, combineLatest } from "rxjs"
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, startWith } from "rxjs/operators"
import { Patient } from "../../../../shared/models/patient.model"
import { PatientService } from "../../../../shared/services/patient.service"
import { inject } from "@angular/core"

@Component({
  selector: "app-patient-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="modern-card">
      <div class="section-header patients">
        <h2 class="section-title">Patient Directory</h2>
        <p class="section-subtitle">Manage all patients in the system</p>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-field">
            <mat-form-field appearance="fill">
              <mat-label>Search by name or email...</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search patients">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Table Section -->
      <div *ngIf="!loading && !error" class="table-section">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of patients">
              <td>
                <div style="font-weight: 500; color: #1e293b;">
                  {{ patient.firstName }} {{ patient.lastName }}
                </div>
              </td>
              <td>{{ patient.email }}</td>
              <td>{{ patient.phoneNumber }}</td>
              <td>{{ patient.dob | date:'M/d/yyyy' }}</td>
              <td>
                <button class="action-btn view" [routerLink]="['/patients', patient._id]" title="View Details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button class="action-btn edit" [routerLink]="['/patients', patient._id, 'edit']" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="action-btn delete" (click)="deletePatient(patient)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="!loading && !error && totalPatients > 0"
        [length]="totalPatients"
        [pageSize]="10"
        [pageIndex]="currentPage"
        (page)="onPageChange($event)"
        [hidePageSize]="true"
        aria-label="Select page"
        style="margin-top: 20px;">
      </mat-paginator>
    </div>
  `,
  styles: [],
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients: Patient[] = []
  totalPatients = 0
  loading = false
  error: string | null = null

  searchControl = new FormControl("")
  private destroy$ = new Subject<void>()
  private readonly pageSubject = new BehaviorSubject<number>(0)
  public currentPage = 0

  private readonly patientService = inject(PatientService)

  ngOnInit(): void {
    this.setupSearch()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setupSearch(): void {
    const search$ = this.searchControl.valueChanges.pipe(startWith(""), debounceTime(300), distinctUntilChanged())

    combineLatest([search$, this.pageSubject])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([searchTerm, page]) => {
          this.loading = true
          this.error = null
          return this.patientService.getPatients(page + 1, 10, searchTerm || undefined)
        }),
      )
      .subscribe({
        next: (response) => {
          this.patients = response.data
          this.totalPatients = response.total
          this.loading = false
        },
        error: (error) => {
          this.error = "Failed to load patients. Please try again."
          this.loading = false
          console.error("Error loading patients:", error)
        },
      })
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSubject.next(event.pageIndex);
  }

  deletePatient(patient: Patient): void {
    if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      this.patientService.deletePatient(patient._id!).subscribe({
        next: () => {
          this.pageSubject.next(0)
        },
        error: (error) => {
          this.error = "Failed to delete patient. Please try again."
          console.error("Error deleting patient:", error)
        },
      })
    }
  }
}

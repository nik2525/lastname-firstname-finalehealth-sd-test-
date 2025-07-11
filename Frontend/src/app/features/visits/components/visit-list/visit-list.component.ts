import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { VisitService } from '../../../../shared/services/visit.service';
import { PatientService } from '../../../../shared/services/patient.service';
import { Visit } from '../../../../shared/models/visit.model';
import { Patient } from '../../../../shared/models/patient.model';

// Define types for patient and visit IDs
type PatientIdType = string | { _id: string | { $oid: string } } | null | undefined;
type VisitIdType = string | { $oid: string } | null | undefined;

@Component({
  selector: "app-visit-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="modern-card" *ngIf="!patientId">
      <div class="section-header visits">
        <h2 class="section-title">Visit Management</h2>
        <p class="section-subtitle">All patient visits</p>
      </div>

      <!-- Filters Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-field">
            <mat-form-field appearance="fill">
              <mat-label>All Patients</mat-label>
              <mat-select [formControl]="patientFilter">
                <mat-option value="">All Patients</mat-option>
                <mat-option *ngFor="let patient of patients" [value]="patient._id">
                  {{ patient.firstName }} {{ patient.lastName }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="search-field">
            <mat-form-field appearance="fill">
              <mat-label>Newest First</mat-label>
              <mat-select [formControl]="sortFilter">
                <mat-option value="newest">Newest First</mat-option>
                <mat-option value="oldest">Oldest First</mat-option>
              </mat-select>
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
              <th>Patient</th>
              <th>Visit Date</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let visit of filteredVisits">
              <td>
                <div style="font-weight: 500; color: #1e293b;">
                  {{ getPatientName(visit.patientId) }}
                </div>
              </td>
              <td>{{ visit.visitDate | date:'M/d/yyyy' }}</td>
              <td>
                <span class="visit-badge" [ngClass]="visit.visitType.toLowerCase()">
                  <mat-icon *ngIf="visit.visitType === 'Telehealth'">videocam</mat-icon>
                  <mat-icon *ngIf="visit.visitType === 'Home'">home</mat-icon>
                  <mat-icon *ngIf="visit.visitType === 'Clinic'">local_hospital</mat-icon>
                  {{ visit.visitType }}
                </span>
              </td>
              <td>
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ visit.notes || 'No notes' }}
                </div>
              </td>
              <td>
                <button class="action-btn edit" (click)="editVisit(visit)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="action-btn delete" (click)="deleteVisit(visit)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Patient-specific visit list -->
    <div *ngIf="patientId">
      <div class="visit-list-header">
        <h2>Patient Visits</h2>
        <button class="btn-primary" (click)="navigateToAddVisit()">
          <mat-icon>add</mat-icon>
          Add Visit
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <div *ngIf="visits.length === 0 && !loading && !error" class="no-visits">
        <mat-icon>event_note</mat-icon>
        <p>No visits recorded for this patient yet.</p>
        <button class="btn-primary" (click)="navigateToAddVisit()">
          Add First Visit
        </button>
      </div>

      <div class="visits-container" *ngIf="visits.length > 0 && !loading">
        <div *ngFor="let visit of visits" class="modern-card" style="margin-bottom: 16px;">
          <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                {{ visit.visitDate | date:'fullDate' }}
              </h3>
              <span class="visit-badge" [ngClass]="visit.visitType.toLowerCase()">
                {{ visit.visitType }}
              </span>
            </div>
          </div>
          
          <div style="padding: 24px;">
            <div class="visit-notes" *ngIf="visit.notes">
              <strong>Notes:</strong>
              <p>{{ visit.notes }}</p>
            </div>
            
            <div class="visit-meta">
              <small>Created: {{ visit.dateCreated | date:'medium' }}</small>
            </div>
          </div>
          
          <div style="padding: 0 24px 24px 24px;">
            <button class="btn-secondary" (click)="editVisit(visit)" style="margin-right: 8px;">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button class="btn-secondary" (click)="deleteVisit(visit)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .visit-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .visits-container {
      display: grid;
      gap: 16px;
    }
    
    .visit-time {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #666;
    }
    
    .visit-notes {
      margin-bottom: 12px;
    }
    
    .visit-notes p {
      margin: 4px 0;
      line-height: 1.5;
    }
    
    .visit-meta {
      color: #999;
      font-size: 0.85em;
    }
    
    .no-visits {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .no-visits mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }
    
    @media (max-width: 600px) {
      .visit-list-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `,
  ],
})
export class VisitListComponent implements OnInit {
  @Input() patientId?: string

  visits: Visit[] = [];
  patients: Patient[] = [];
  filteredVisits: Visit[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  patientFilter = new FormControl('');
  sortFilter = new FormControl('newest');

  private visitService = inject(VisitService);
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    if (this.patientId) {
      this.loadPatientVisits();
    } else {
      this.loadAllData();
    }
  }

  private loadPatientVisits(): void {
    if (!this.patientId) return;
    
    this.visitService.getPatientVisits(this.patientId).subscribe({
      next: (visits: Visit[]) => {
        this.visits = visits;
        this.filteredVisits = [...this.visits];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load patient visits.';
        this.loading = false;
        console.error('Error loading patient visits:', error);
      },
    });
  }

  private loadAllData(refreshCache = false): void {
    this.loading = true;
    this.error = null;

    // Clear the patients array before loading new data
    this.patients = [];
    this.visits = [];
    this.filteredVisits = [];

    // Force refresh cache if needed
    const patients$ = refreshCache 
      ? this.patientService.getPatients(1, 1000, '', true)
      : this.patientService.getPatients(1, 1000);

    // Process patients response
    const processedPatients$ = patients$.pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response as Patient[];
        }
        // Handle paginated response
        const paginatedResponse = response as { data: Patient[] };
        return paginatedResponse?.data || [];
      })
    );

    // Process visits response
    const processedVisits$ = this.visitService.getAllVisits().pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response as Visit[];
        }
        // Handle paginated response
        const paginatedResponse = response as { data: Visit[] };
        return paginatedResponse?.data || [];
      })
    );

    forkJoin({
      patients: processedPatients$,
      visits: processedVisits$
    }).subscribe({
      next: ({ patients, visits }) => {
        try {
          this.patients = [...patients];
          this.visits = [...visits];
          

          this.filteredVisits = [...this.visits];
          this.applyFilters();
        } catch (error) {
          console.error('Error processing data:', error);
          this.error = 'Error processing data. Please try again.';
        } finally {
          this.loading = false;
        }
      },
      error: (error: Error) => {
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
        console.error('Error loading data:', error);
      },
    });
  }

  private setupFilters(): void {
    this.patientFilter.valueChanges.subscribe(() => this.applyFilters());
    this.sortFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  private extractPatientId(patientId: PatientIdType): string {
    if (!patientId) return '';
    if (typeof patientId === 'string') return patientId;
    if (patientId && '_id' in patientId) {
      const id = patientId._id;
      if (typeof id === 'string') return id;
      if (id && typeof id === 'object' && '$oid' in id) return id.$oid;
    }
    return '';
  }

  private applyFilters(): void {
    let filtered = [...this.visits];

    // Filter by patient
    const selectedPatient = this.patientFilter.value;
    if (selectedPatient) {
      filtered = filtered.filter(visit => {
        const visitPatientId = this.extractPatientId(visit.patientId as PatientIdType);
        return visitPatientId === selectedPatient;
      });
    }

    // Sort by date
    const sortOrder = this.sortFilter.value;
    filtered.sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    this.filteredVisits = filtered;
  }

  getPatientName(patientId: PatientIdType): string {
    if (!patientId) return 'Unknown Patient';
    
    // Handle both string ID and populated patient object
    let patient: Patient | undefined;
    
    if (typeof patientId === 'string') {
      patient = this.patients.find(p => p._id === patientId);
    } else if (patientId && typeof patientId === 'object' && '_id' in patientId) {
      // If it's a patient object
      const patientIdStr = this.extractPatientId(patientId);
      patient = this.patients.find(p => p._id === patientIdStr) || (patientId as Patient);
    }
      
    if (!patient) return 'Unknown Patient';
    
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unnamed Patient';
  }

  editVisit(visit: Visit): void {
    if (!visit?._id) {
      console.error('Cannot edit visit: Invalid visit data');
      return;
    }
    
    // Helper function to extract ID from different possible types
    const extractId = (id: VisitIdType): string => {
      if (!id) return '';
      if (typeof id === 'string') return id;
      if (id && typeof id === 'object' && '$oid' in id) return id.$oid;
      return '';
    };
    
    const visitId = extractId(visit._id);
    if (!visitId) {
      console.error('Cannot edit visit: No valid ID found');
      return;
    }
    
    // Navigate to the edit route with the visit ID
    this.router.navigate(['/visits', visitId, 'edit']);
  }

  navigateToAddVisit(): void {
    if (this.patientId) {
      this.router.navigate(['/visits/new'], { 
        queryParams: { patientId: this.patientId } 
      });
    } else {
      // If no patientId is set (viewing all visits), navigate without patientId
      this.router.navigate(['/visits/new']);
    }
  }

  deleteVisit(visit: Visit): void {
    if (confirm('Are you sure you want to delete this visit?')) {
      // Helper function to extract ID from different possible types
      const extractId = (id: VisitIdType): string => {
        if (!id) return '';
        if (typeof id === 'string') return id;
        if (id && typeof id === 'object' && '$oid' in id) return id.$oid;
        return '';
      };
      
      const visitId = extractId(visit._id);
      if (!visitId) {
        console.error('Cannot delete visit: Invalid visit ID');
        return;
      }

      this.visitService.deleteVisit(visitId).subscribe({
        next: () => {
          // Force refresh the data to ensure we have the latest state
          if (this.patientId) {
            this.loadPatientVisits();
          } else {
            this.loadAllData(true); // Force refresh with cache busting
          }
        },
        error: (error: Error) => {
          this.error = 'Failed to delete visit. Please try again.';
          console.error('Error deleting visit:', error);
        },
      });
    }
  }
}

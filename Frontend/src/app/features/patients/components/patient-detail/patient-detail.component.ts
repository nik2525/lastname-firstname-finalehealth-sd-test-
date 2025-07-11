import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatTabsModule } from "@angular/material/tabs"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { Patient } from "../../../../shared/models/patient.model"
import { PatientService } from "../../../../shared/services/patient.service"
import { VisitService } from "../../../../shared/services/visit.service"
import { VisitListComponent } from "../../../visits/components/visit-list/visit-list.component"

@Component({
  selector: "app-patient-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule, VisitListComponent],
  template: `
    <div *ngIf="loading" class="loading-spinner">
      <mat-spinner></mat-spinner>
    </div>

    <div *ngIf="error" class="error-message">
      {{ error }}
    </div>

    <div *ngIf="patient && !loading">
      <div class="page-header">
        <h1>{{ patient.firstName }} {{ patient.lastName }}</h1>
        <div class="header-actions">
          <button class="btn-primary" [routerLink]="['/patients', patient._id, 'edit']">
            <mat-icon>edit</mat-icon>
            Edit Patient
          </button>
          <button class="btn-secondary" routerLink="/patients">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Patient Information">
          <div class="tab-content">
            <div class="modern-card">
              <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Personal Information</h3>
              </div>
              <div style="padding: 24px;">
                <div class="info-grid">
                  <div class="info-item">
                    <strong>Name:</strong>
                    <span>{{ patient.firstName }} {{ patient.lastName }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Email:</strong>
                    <span>{{ patient.email }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Phone:</strong>
                    <span>{{ patient.phoneNumber }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Date of Birth:</strong>
                    <span>{{ patient.dob | date:'longDate' }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Address:</strong>
                    <span>{{ patient.address }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Patient Since:</strong>
                    <span>{{ patient.dateCreated | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modern-card" *ngIf="visitStats" style="margin-top: 20px;">
              <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Visit Summary</h3>
              </div>
              <div style="padding: 24px;">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number">{{ visitStats.totalVisits }}</div>
                    <div class="stat-label">Total Visits</div>
                  </div>
                  <div class="stat-item" *ngFor="let type of getVisitTypes()">
                    <div class="stat-number">{{ visitStats.visitsByType[type] || 0 }}</div>
                    <div class="stat-label">{{ type }} Visits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Visits">
          <div class="tab-content">
            <app-visit-list [patientId]="patient._id!"></app-visit-list>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
    .tab-content {
      padding: 20px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .info-item strong {
      color: #666;
      font-size: 0.9em;
    }
    
    .stats-grid {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #3f51b5;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    @media (max-width: 600px) {
      .header-actions {
        flex-direction: column;
      }
      
      .stats-grid {
        justify-content: center;
      }
    }
  `,
  ],
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null
  visitStats: any = null
  loading = false
  error: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private visitService: VisitService,
  ) {}

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get("id")
    if (patientId) {
      this.loadPatientDetails(patientId)
    } else {
      this.router.navigate(["/patients"])
    }
  }

  private loadPatientDetails(patientId: string): void {
    this.loading = true
    this.error = null

    this.patientService.getPatient(patientId).subscribe({
      next: (patient) => {
        this.patient = patient
        this.loadVisitStats(patientId)
      },
      error: (error) => {
        this.error = "Failed to load patient details."
        this.loading = false
        console.error("Error loading patient:", error)
      },
    })
  }

  private loadVisitStats(patientId: string): void {
    this.visitService.getVisitStats(patientId).subscribe({
      next: (stats) => {
        this.visitStats = stats
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading visit stats:", error)
        this.loading = false
      },
    })
  }

  getVisitTypes(): string[] {
    return ["Home", "Telehealth", "Clinic"]
  }
}

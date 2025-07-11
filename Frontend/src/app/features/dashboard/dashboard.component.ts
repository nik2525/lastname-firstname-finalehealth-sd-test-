import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { RouterModule } from "@angular/router"
import { PatientService } from "../../shared/services/patient.service"
import { VisitService } from "../../shared/services/visit.service"
import { Visit, VisitType } from "../../shared/models/visit.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  template: `
    <div class="modern-card">
      <div class="section-header dashboard">
        <h2 class="section-title">Dashboard</h2>
        <p class="section-subtitle">Overview of your healthcare management system</p>
      </div>

      <!-- Stats Grid -->
      <div style="padding: 32px;">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon patients">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ totalPatients }}</h3>
              <p>Total Patients</p>
              <span class="stat-change"></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon visits">
              <mat-icon>event_note</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ totalVisits }}</h3>
              <p>Total Visits</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon home">
              <mat-icon>home</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ homeVisits }}</h3>
              <p>Home Visits</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon telehealth">
              <mat-icon>videocam</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ telehealthVisits }}</h3>
              <p>Telehealth</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon clinic">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ clinicVisits }}</h3>
              <p>Clinic Visits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .stat-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .stat-icon.patients { background-color: #3f51b5; }
    .stat-icon.visits { background-color: #9c27b0; }
    .stat-icon.home { background-color: #4caf50; }
    .stat-icon.telehealth { background-color: #2196f3; }
    .stat-icon.clinic { background-color: #ff9800; }
    
    .stat-content h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .stat-content p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }
  `],
})
export class DashboardComponent implements OnInit {
  // Make VisitType accessible in the template
  VisitType = VisitType;
  
  totalPatients = 0
  totalVisits = 0
  homeVisits = 0
  telehealthVisits = 0
  clinicVisits = 0

  constructor(
    private patientService: PatientService,
    private visitService: VisitService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  private loadDashboardData(): void {
    // Load patients count
    this.patientService.getPatients(1, 1).subscribe((response) => {
      this.totalPatients = response.total;
    });

    // Load visits data
    this.visitService.getAllVisits().subscribe({
      next: (visits: Visit[]) => {
        this.totalVisits = visits.length;
        this.homeVisits = visits.filter((v: Visit) => v.visitType === VisitType.HOME).length;
        this.telehealthVisits = visits.filter((v: Visit) => v.visitType === VisitType.TELEHEALTH).length;
        this.clinicVisits = visits.filter((v: Visit) => v.visitType === VisitType.CLINIC).length;
      },
      error: (error: Error) => {
        console.error('Error loading visits:', error);
      }
    });
  }
}

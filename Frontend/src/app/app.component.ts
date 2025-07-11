import { Component } from "@angular/core"
import { RouterOutlet, RouterModule } from "@angular/router"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatIconModule],
  template: `
    <div class="container">
      <!-- App Header -->
      <div class="app-header">
        <div class="app-header-content">
          <div class="app-icon">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div>
            <h1 class="app-title">Patient & Visit Management</h1>
            <p class="app-subtitle">Streamline healthcare management with modern efficiency</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-tabs">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-tab dashboard">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </a>
        <a routerLink="/patients" routerLinkActive="active" class="nav-tab patients">
          <mat-icon>people</mat-icon>
          Patients
        </a>
        <a routerLink="/patients/new" routerLinkActive="active" class="nav-tab add-patient">
          <mat-icon>person_add</mat-icon>
          Add Patient
        </a>
        <a routerLink="/visits" routerLinkActive="active" class="nav-tab visits">
          <mat-icon>event_note</mat-icon>
          Visits
        </a>
        <a routerLink="/visits/new" routerLinkActive="active" class="nav-tab add-visit">
          <mat-icon>add_circle</mat-icon>
          Add Visit
        </a>
      </nav>

      <!-- Main Content -->
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = "Patient Management System"
}

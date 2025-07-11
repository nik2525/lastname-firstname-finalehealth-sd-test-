import type { Routes } from "@angular/router"

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "patients",
    loadChildren: () => import("./features/patients/patients.routes").then((m) => m.PATIENT_ROUTES),
  },
  {
    path: "visits",
    loadChildren: () => import("./features/visits/components/visits.routes").then((m) => m.VISIT_ROUTES),
  },
  { path: "**", redirectTo: "/dashboard" },
]

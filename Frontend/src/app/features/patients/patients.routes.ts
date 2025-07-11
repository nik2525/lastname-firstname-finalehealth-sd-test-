import type { Routes } from "@angular/router"
import { PatientListComponent } from "./components/patient-list/patient-list.component"
import { PatientFormComponent } from "./components/patient-form/patient-form.component"
import { PatientDetailComponent } from "./components/patient-detail/patient-detail.component"

export const PATIENT_ROUTES: Routes = [
  { path: "", component: PatientListComponent },
  { path: "new", component: PatientFormComponent },
  { path: ":id/edit", component: PatientFormComponent },
  { path: ":id", component: PatientDetailComponent },
]

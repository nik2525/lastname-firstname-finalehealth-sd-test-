import type { Routes } from "@angular/router"
import { VisitListComponent } from "./visit-list/visit-list.component"
import { VisitFormComponent } from "./visit-form/visit-form.component"

export const VISIT_ROUTES: Routes = [
  { path: "", component: VisitListComponent },
  { path: "new", component: VisitFormComponent },
  { path: ":id/edit", component: VisitFormComponent },
]

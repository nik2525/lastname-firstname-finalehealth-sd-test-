import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { provideRouter } from "@angular/router"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideHttpClient } from "@angular/common/http"
import { routes } from "./app/app.routes"
import { importProvidersFrom } from "@angular/core"
import { MatDialogModule } from "@angular/material/dialog"

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideAnimations(), provideHttpClient(), importProvidersFrom(MatDialogModule)],
}).catch((err) => console.error(err))

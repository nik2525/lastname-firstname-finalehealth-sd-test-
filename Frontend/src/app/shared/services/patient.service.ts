import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { Patient, CreatePatientDto, UpdatePatientDto } from "../models/patient.model";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: "root",
})
export class PatientService {
  private readonly apiUrl = "http://localhost:3000/api";
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();
  private http = inject(HttpClient);

  private parsePatientDates(patient: Patient): Patient {
    return {
      ...patient,
      dob: patient.dob ? new Date(patient.dob) : new Date(),
      dateCreated: patient.dateCreated ? new Date(patient.dateCreated) : new Date(),
      dateUpdated: patient.dateUpdated ? new Date(patient.dateUpdated) : new Date()
    };
  }

  getPatients(page = 1, limit = 10, search?: string, refreshCache = false): Observable<PaginatedResponse<Patient>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('_t', refreshCache ? Date.now().toString() : ''); // Add timestamp for cache busting

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Patient>>(`${this.apiUrl}/patients`, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(patient => this.parsePatientDates(patient))
      })),
      tap(response => this.patientsSubject.next(response.data)),
      catchError(error => {
        console.error('Error fetching patients:', error);
        throw error;
      })
    );
  }

  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`).pipe(
      map(patient => this.parsePatientDates(patient)),
      catchError(error => {
        console.error(`Error fetching patient ${id}:`, error);
        throw error;
      })
    );
  }

  createPatient(patientData: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, patientData).pipe(
      map(patient => this.parsePatientDates(patient)),
      tap(newPatient => {
        const currentPatients = this.patientsSubject.value;
        this.patientsSubject.next([...currentPatients, newPatient]);
      }),
      catchError(error => {
        console.error('Error creating patient:', error);
        throw error;
      })
    );
  }

  updatePatient(id: string, patientData: UpdatePatientDto): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, patientData).pipe(
      map(patient => this.parsePatientDates(patient)),
      tap(updatedPatient => {
        const currentPatients = this.patientsSubject.value;
        const updatedPatients = currentPatients.map(patient => 
          patient._id === id ? { ...patient, ...updatedPatient } : patient
        );
        this.patientsSubject.next(updatedPatients);
      }),
      catchError(error => {
        console.error(`Error updating patient ${id}:`, error);
        throw error;
      })
    );
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/patients/${id}`).pipe(
      tap(() => {
        const currentPatients = this.patientsSubject.value;
        const updatedPatients = currentPatients.filter(patient => patient._id !== id);
        this.patientsSubject.next(updatedPatients);
      }),
      catchError(error => {
        console.error(`Error deleting patient ${id}:`, error);
        throw error;
      })
    );
  }

  private refreshPatients(): void {
    this.getPatients().subscribe();
  }
}

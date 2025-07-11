import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { Visit, CreateVisitDto, UpdateVisitDto, VisitType } from "../models/visit.model";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private readonly apiUrl = "http://localhost:3000/api";
  private visitsSubject = new BehaviorSubject<Visit[]>([]);
  public visits$ = this.visitsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPatientVisits(patientId: string): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/patients/${patientId}/visits`).pipe(
      map((response: any) => {
        // Handle both direct array response and paginated response
        const visits = Array.isArray(response) ? response : (response.data || response.items || []);
        return visits.map((visit: any) => ({
          ...visit,
          visitDate: new Date(visit.visitDate),
          patientId: visit.patientId || patientId // Ensure patientId is set
        }));
      }),
      tap(visits => {
        this.visitsSubject.next(visits);
      }),
      catchError(error => {
        console.error('Error fetching patient visits:', error);
        throw error;
      })
    );
  }

  getAllVisits(): Observable<Visit[]> {
    // Set a high limit to get all visits at once
    const params = {
      limit: '1000', // Adjust this number based on your expected maximum visits
      sortBy: 'visitDate',
      sortOrder: 'desc'
    };

    return this.http.get<Visit[]>(`${this.apiUrl}/visits`, { params }).pipe(
      map((response: any) => {
        // Handle both direct array response and paginated response
        const visits = Array.isArray(response) ? response : (response.data || response.items || []);
        return visits.map((visit: any) => ({
          ...visit,
          visitDate: new Date(visit.visitDate),
          patientId: visit.patientId || visit.patient?._id // Handle nested patient object if present
        }));
      }),
      tap(visits => {
        this.visitsSubject.next(visits);
      }),
      catchError(error => {
        console.error('Error fetching all visits:', error);
        throw error;
      })
    );
  }

  getVisitById(id: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/visits/${id}`).pipe(
      map(visit => ({
        ...visit,
        visitDate: new Date(visit.visitDate)
      })),
      catchError(error => {
        console.error(`Error fetching visit ${id}:`, error);
        throw error;
      })
    );
  }

  createVisit(visitData: CreateVisitDto): Observable<Visit> {
    const { patientId, ...visitDataWithoutId } = visitData;
    return this.http.post<Visit>(`${this.apiUrl}/patients/${patientId}/visits`, visitDataWithoutId).pipe(
      tap(newVisit => {
        const currentVisits = this.visitsSubject.value;
        this.visitsSubject.next([...currentVisits, newVisit]);
      }),
      catchError(error => {
        console.error('Error creating visit:', error);
        throw error;
      })
    );
  }

  updateVisit(id: string, visitData: UpdateVisitDto): Observable<Visit> {
    // Create a copy of visitData without any undefined values
    const cleanedVisitData = Object.fromEntries(
      Object.entries(visitData).filter(([_, v]) => v !== undefined)
    );
    
    return this.http.put<Visit>(`${this.apiUrl}/visits/${id}`, cleanedVisitData).pipe(
      map((updatedVisit: any) => ({
        ...updatedVisit,
        visitDate: new Date(updatedVisit.visitDate)
      })),
      tap(updatedVisit => {
        const currentVisits = this.visitsSubject.value;
        const updatedVisits = currentVisits.map(visit => 
          visit._id === id ? { ...visit, ...updatedVisit } : visit
        );
        this.visitsSubject.next(updatedVisits);
      }),
      catchError(error => {
        console.error(`Error updating visit ${id}:`, error);
        throw error;
      })
    );
  }

  deleteVisit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/visits/${id}`).pipe(
      tap(() => {
        const currentVisits = this.visitsSubject.value;
        const updatedVisits = currentVisits.filter(visit => visit._id !== id);
        this.visitsSubject.next(updatedVisits);
      }),
      catchError(error => {
        console.error(`Error deleting visit ${id}:`, error);
        throw error;
      })
    );
  }

  getVisitStats(patientId: string): Observable<any> {
    return this.getPatientVisits(patientId).pipe(
      map((visits) => ({
        totalVisits: visits.length,
        visitsByType: this.groupVisitsByType(visits),
        recentVisits: visits.slice(0, 5),
      }))
    );
  }

  private groupVisitsByType(visits: Visit[]): { [key: string]: number } {
    return visits.reduce(
      (acc, visit) => {
        acc[visit.visitType] = (acc[visit.visitType] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );
  }

  private refreshVisits(patientId: string): void {
    this.getPatientVisits(patientId).subscribe();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Visit related methods
  getVisits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visits`);
  }

  getVisitById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/visits/${id}`);
  }

  createVisit(visitData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/visits`, visitData);
  }

  updateVisit(id: string, visitData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/visits/${id}`, visitData);
  }

  deleteVisit(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/visits/${id}`);
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationRequest, JobApplication, Page } from './models';

export interface ListParams {
  page: number;
  size: number;
  sortBy: string;
  direction: 'asc' | 'desc';
  status?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/applications';

  list(p: ListParams): Observable<Page<JobApplication>> {
    let params = new HttpParams()
      .set('page', p.page)
      .set('size', p.size)
      .set('sortBy', p.sortBy)
      .set('direction', p.direction);
    if (p.status) {
      params = params.set('status', p.status);
    }
    if (p.search?.trim()) {
      params = params.set('search', p.search.trim());
    }
    return this.http.get<Page<JobApplication>>(this.url, { params });
  }

  get(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.url}/${id}`);
  }

  create(body: ApplicationRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.url, body);
  }

  update(id: number, body: ApplicationRequest): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.url}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  stats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.url}/stats`);
  }
}

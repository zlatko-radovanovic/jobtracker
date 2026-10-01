import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Company, CompanyRequest } from './models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/companies';

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(this.url);
  }

  create(body: CompanyRequest): Observable<Company> {
    return this.http.post<Company>(this.url, body);
  }

  update(id: number, body: CompanyRequest): Observable<Company> {
    return this.http.put<Company>(`${this.url}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

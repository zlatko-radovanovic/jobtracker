import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ApplicationService } from '../../core/application.service';
import { errorMessage } from '../../core/http-error';
import { JobApplication, Page, STATUSES, statusLabel } from '../../core/models';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-head">
      <h1>Prijave</h1>
      <a class="btn primary" routerLink="/applications/new">Nova prijava</a>
    </div>

    <div class="filters">
      <input type="search" [formControl]="search" placeholder="Pretraži po poziciji ili firmi" aria-label="Pretraga" />
      <select [formControl]="status" aria-label="Filter po statusu">
        <option value="">Svi statusi</option>
        @for (s of statuses; track s.value) {
          <option [value]="s.value">{{ s.label }}</option>
        }
      </select>
    </div>

    @if (error) {
      <p class="alert" role="alert">{{ error }}</p>
    }

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th><button type="button" class="sort" (click)="sort('position')">Pozicija{{ arrow('position') }}</button></th>
            <th><button type="button" class="sort" (click)="sort('company.name')">Firma{{ arrow('company.name') }}</button></th>
            <th><button type="button" class="sort" (click)="sort('status')">Status{{ arrow('status') }}</button></th>
            <th><button type="button" class="sort" (click)="sort('appliedDate')">Datum{{ arrow('appliedDate') }}</button></th>
            <th class="num">Plata</th>
            <th><span class="sr-only">Akcije</span></th>
          </tr>
        </thead>
        <tbody>
          @for (a of data.content; track a.id) {
            <tr>
              <td>{{ a.position }}</td>
              <td>{{ a.companyName }}</td>
              <td><span class="badge {{ a.status.toLowerCase() }}">{{ label(a.status) }}</span></td>
              <td>{{ a.appliedDate }}</td>
              <td class="num">{{ a.salary ?? '-' }}</td>
              <td class="row-actions">
                <a [routerLink]="['/applications', a.id, 'edit']">Izmeni</a>
                <button type="button" class="link danger" (click)="remove(a)">Obriši</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="empty-cell">
                {{ loading ? 'Učitavam...' : 'Nema prijava za izabrane filtere.' }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="pager">
      <span class="muted">Ukupno: {{ data.totalElements }}</span>
      <div>
        <button type="button" class="btn" (click)="go(page - 1)" [disabled]="page === 0">Prethodna</button>
        <span class="page-num">{{ page + 1 }} / {{ data.totalPages || 1 }}</span>
        <button type="button" class="btn" (click)="go(page + 1)" [disabled]="page + 1 >= data.totalPages">Sledeća</button>
      </div>
    </div>
  `,
})
export class ApplicationListComponent implements OnInit {
  private readonly api = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);

  readonly statuses = STATUSES;
  readonly search = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('', { nonNullable: true });

  data: Page<JobApplication> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
  page = 0;
  sortBy = 'appliedDate';
  direction: 'asc' | 'desc' = 'desc';
  loading = false;
  error = '';

  private readonly reload$ = new Subject<void>();

  constructor() {
    // switchMap otkazuje prethodni zahtev ako stigne novi (nema "preskakanja" rezultata)
    this.reload$
      .pipe(
        switchMap(() => {
          this.loading = true;
          this.error = '';
          return this.api
            .list({
              page: this.page,
              size: 10,
              sortBy: this.sortBy,
              direction: this.direction,
              status: this.status.value,
              search: this.search.value,
            })
            .pipe(
              catchError((err) => {
                this.error = errorMessage(err);
                return of(null);
              }),
            );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.loading = false;
        if (res) {
          this.data = res;
        }
      });

    // debounceTime: ne šalje zahtev na svaki otkucani karakter, već tek kad korisnik stane da kuca
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndReload());

    this.status.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.resetAndReload());
  }

  ngOnInit(): void {
    // Ako dolazimo sa dashboard-a (?status=INTERVIEW), unapred izaberi taj filter
    const initial = this.route.snapshot.queryParamMap.get('status');
    if (initial) {
      this.status.setValue(initial, { emitEvent: false });
    }
    this.reload$.next();
  }

  label(s: JobApplication['status']): string {
    return statusLabel(s);
  }

  sort(field: string): void {
    if (this.sortBy === field) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.direction = 'asc';
    }
    this.resetAndReload();
  }

  arrow(field: string): string {
    if (this.sortBy !== field) {
      return '';
    }
    return this.direction === 'asc' ? ' ↑' : ' ↓';
  }

  go(page: number): void {
    this.page = page;
    this.reload$.next();
  }

  remove(a: JobApplication): void {
    if (!confirm(`Obrisati prijavu "${a.position}" (${a.companyName})?`)) {
      return;
    }
    this.api.delete(a.id).subscribe({
      next: () => {
        // Ako smo obrisali jedinu stavku na poslednjoj stranici, vrati se jednu stranicu nazad
        if (this.data.content.length === 1 && this.page > 0) {
          this.page--;
        }
        this.reload$.next();
      },
      error: (err) => (this.error = errorMessage(err)),
    });
  }

  private resetAndReload(): void {
    this.page = 0;
    this.reload$.next();
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../core/application.service';
import { errorMessage } from '../../core/http-error';
import { STATUSES } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Pregled</h1>

    @if (error) {
      <p class="alert" role="alert">{{ error }}</p>
    } @else if (stats) {
      @if (total === 0) {
        <div class="empty">
          <h2>Još nema prijava</h2>
          <p>Prvo dodaj firmu, pa unesi prijavu za posao. Ovde ćeš videti kako napreduju.</p>
          <div class="actions">
            <a class="btn primary" routerLink="/companies">Dodaj firmu</a>
            <a class="btn" routerLink="/applications/new">Dodaj prijavu</a>
          </div>
        </div>
      } @else {
        <p class="lead">
          Ukupno <strong>{{ total }}</strong> prijava, a na intervju si pozvan u
          <strong>{{ interviewRate }}%</strong> slučajeva.
        </p>

        <!-- Jedna traka: širina svakog dela srazmerna je broju prijava u tom statusu -->
        <div class="pipeline" role="img" [attr.aria-label]="chartLabel">
          @for (s of statuses; track s.value) {
            @if (count(s.value) > 0) {
              <span class="seg {{ s.value.toLowerCase() }}" [style.flex-grow]="count(s.value)"></span>
            }
          }
        </div>

        <ul class="stat-list">
          @for (s of statuses; track s.value) {
            <li>
              <span class="dot {{ s.value.toLowerCase() }}"></span>
              <a [routerLink]="['/applications']" [queryParams]="{ status: s.value }">{{ s.label }}</a>
              <strong>{{ count(s.value) }}</strong>
            </li>
          }
        </ul>
      }
    } @else {
      <p class="muted">Učitavam...</p>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApplicationService);

  readonly statuses = STATUSES;
  stats: Record<string, number> | null = null;
  error = '';

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (s) => (this.stats = s),
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  count(status: string): number {
    return this.stats?.[status] ?? 0;
  }

  get total(): number {
    return Object.values(this.stats ?? {}).reduce((a, b) => a + b, 0);
  }

  // Udeo prijava koje su stigle do intervjua ili ponude
  get interviewRate(): number {
    return this.total === 0 ? 0 : Math.round(((this.count('INTERVIEW') + this.count('OFFER')) / this.total) * 100);
  }

  get chartLabel(): string {
    return this.statuses.map((s) => `${s.label}: ${this.count(s.value)}`).join(', ');
  }
}

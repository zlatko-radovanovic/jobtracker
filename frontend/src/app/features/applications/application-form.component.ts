import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationService } from '../../core/application.service';
import { CompanyService } from '../../core/company.service';
import { errorMessage } from '../../core/http-error';
import { ApplicationRequest, ApplicationStatus, Company, STATUSES } from '../../core/models';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-head">
      <h1>{{ id ? 'Izmena prijave' : 'Nova prijava' }}</h1>
    </div>

    @if (companiesLoaded && companies.length === 0) {
      <div class="empty">
        <h2>Prvo dodaj firmu</h2>
        <p>Svaka prijava pripada jednoj firmi.</p>
        <div class="actions"><a class="btn primary" routerLink="/companies">Dodaj firmu</a></div>
      </div>
    } @else {
      <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="position">Pozicija</label>
          <input id="position" formControlName="position" placeholder="Npr. Junior Java Developer" />
          @if (invalid('position')) {
            <p class="field-error">Pozicija je obavezna (najviše 150 karaktera).</p>
          }
        </div>

        <div class="field">
          <label for="companyId">Firma</label>
          <select id="companyId" formControlName="companyId">
            <option [ngValue]="null">Izaberi firmu</option>
            @for (c of companies; track c.id) {
              <option [ngValue]="c.id">{{ c.name }}</option>
            }
          </select>
          @if (invalid('companyId')) {
            <p class="field-error">Izaberi firmu.</p>
          }
        </div>

        <div class="grid-2">
          <div class="field">
            <label for="status">Status</label>
            <select id="status" formControlName="status">
              @for (s of statuses; track s.value) {
                <option [ngValue]="s.value">{{ s.label }}</option>
              }
            </select>
          </div>

          <div class="field">
            <label for="appliedDate">Datum prijave</label>
            <input id="appliedDate" type="date" formControlName="appliedDate" />
            @if (invalid('appliedDate')) {
              <p class="field-error">Datum je obavezan.</p>
            }
          </div>
        </div>

        <div class="field">
          <label for="salary">Plata (opciono)</label>
          <input id="salary" type="number" min="0" formControlName="salary" />
          @if (invalid('salary')) {
            <p class="field-error">Plata ne može biti negativna.</p>
          }
        </div>

        <div class="field">
          <label for="notes">Beleške (opciono)</label>
          <textarea id="notes" rows="4" formControlName="notes"></textarea>
          @if (invalid('notes')) {
            <p class="field-error">Beleške mogu imati najviše 2000 karaktera.</p>
          }
        </div>

        @if (error) {
          <p class="alert" role="alert">{{ error }}</p>
        }

        <div class="actions">
          <button class="btn primary" type="submit" [disabled]="saving">
            {{ saving ? 'Čuvam...' : 'Sačuvaj' }}
          </button>
          <a class="btn" routerLink="/applications">Otkaži</a>
        </div>
      </form>
    }
  `,
})
export class ApplicationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApplicationService);
  private readonly companyApi = inject(CompanyService);

  readonly statuses = STATUSES;
  companies: Company[] = [];
  companiesLoaded = false;
  id: number | null = null;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    position: ['', [Validators.required, Validators.maxLength(150)]],
    companyId: [null as number | null, Validators.required],
    status: ['APPLIED' as ApplicationStatus, Validators.required],
    appliedDate: [new Date().toISOString().substring(0, 10), Validators.required],
    salary: [null as number | null, Validators.min(0)],
    notes: ['', Validators.maxLength(2000)],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    this.companyApi.list().subscribe({
      next: (list) => {
        this.companies = list;
        this.companiesLoaded = true;
      },
      error: (err) => (this.error = errorMessage(err)),
    });

    if (this.id !== null) {
      this.api.get(this.id).subscribe({
        next: (a) =>
          this.form.patchValue({
            position: a.position,
            companyId: a.companyId,
            status: a.status,
            appliedDate: a.appliedDate,
            salary: a.salary,
            notes: a.notes ?? '',
          }),
        error: (err) => (this.error = errorMessage(err)),
      });
    }
  }

  invalid(name: 'position' | 'companyId' | 'appliedDate' | 'salary' | 'notes'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';

    const v = this.form.getRawValue();
    const body: ApplicationRequest = {
      position: v.position,
      companyId: v.companyId as number,
      status: v.status,
      appliedDate: v.appliedDate,
      salary: v.salary,
      notes: v.notes || null,
    };

    const request$ = this.id === null ? this.api.create(body) : this.api.update(this.id, body);
    request$.subscribe({
      next: () => this.router.navigate(['/applications']),
      error: (err) => {
        this.error = errorMessage(err);
        this.saving = false;
      },
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../core/company.service';
import { errorMessage } from '../../core/http-error';
import { Company } from '../../core/models';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1>Firme</h1>

    <form class="card inline-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <h2>{{ editingId ? 'Izmena firme' : 'Nova firma' }}</h2>
      <div class="grid-3">
        <div class="field">
          <label for="name">Naziv</label>
          <input id="name" formControlName="name" />
          @if (form.controls.name.invalid && (form.controls.name.touched || form.controls.name.dirty)) {
            <p class="field-error">Naziv je obavezan (najviše 100 karaktera).</p>
          }
        </div>
        <div class="field">
          <label for="website">Website</label>
          <input id="website" formControlName="website" placeholder="https://" />
        </div>
        <div class="field">
          <label for="city">Grad</label>
          <input id="city" formControlName="city" />
        </div>
      </div>

      @if (error) {
        <p class="alert" role="alert">{{ error }}</p>
      }

      <div class="actions">
        <button class="btn primary" type="submit" [disabled]="saving">
          {{ editingId ? 'Sačuvaj izmene' : 'Dodaj firmu' }}
        </button>
        @if (editingId) {
          <button class="btn" type="button" (click)="cancelEdit()">Otkaži</button>
        }
      </div>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Grad</th>
            <th>Website</th>
            <th><span class="sr-only">Akcije</span></th>
          </tr>
        </thead>
        <tbody>
          @for (c of companies; track c.id) {
            <tr>
              <td>{{ c.name }}</td>
              <td>{{ c.city || '-' }}</td>
              <td>{{ c.website || '-' }}</td>
              <td class="row-actions">
                <button type="button" class="link" (click)="edit(c)">Izmeni</button>
                <button type="button" class="link danger" (click)="remove(c)">Obriši</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="empty-cell">Još nema firmi. Dodaj prvu iznad.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CompanyListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CompanyService);

  companies: Company[] = [];
  editingId: number | null = null;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    website: [''],
    city: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (list) => (this.companies = list),
      error: (err) => (this.error = errorMessage(err)),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';

    const v = this.form.getRawValue();
    const body = { name: v.name, website: v.website || null, city: v.city || null };
    const request$ = this.editingId === null ? this.api.create(body) : this.api.update(this.editingId, body);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.cancelEdit();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = errorMessage(err);
      },
    });
  }

  edit(c: Company): void {
    this.editingId = c.id;
    this.form.setValue({ name: c.name, website: c.website ?? '', city: c.city ?? '' });
    window.scrollTo({ top: 0 });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ name: '', website: '', city: '' });
  }

  remove(c: Company): void {
    if (!confirm(`Obrisati firmu "${c.name}"?`)) {
      return;
    }
    this.error = '';
    this.api.delete(c.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = errorMessage(err)),
    });
  }
}

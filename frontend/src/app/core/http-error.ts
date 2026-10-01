import { HttpErrorResponse } from '@angular/common/http';

// Pretvara grešku sa servera u tekst koji se prikazuje korisniku
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Server nije dostupan. Proveri da li je backend pokrenut.';
    }
    const body = err.error;
    if (body?.errors && Object.keys(body.errors).length > 0) {
      return Object.values(body.errors).join(' ');
    }
    if (body?.message) {
      return body.message;
    }
  }
  return 'Došlo je do greške. Pokušaj ponovo.';
}

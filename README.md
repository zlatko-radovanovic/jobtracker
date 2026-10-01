# JobTracker

Full-stack aplikacija za praćenje prijava za posao.

**Backend:** Java 17+, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA, MySQL, Swagger
**Frontend:** Angular 18 (standalone komponente, Reactive Forms, RxJS, interceptor, route guard, lazy loading)

## Funkcionalnosti
- Registracija i prijava (JWT), uloge USER i ADMIN
- CRUD za firme i prijave (veza 1:N), svaki korisnik vidi samo svoje podatke
- Paginacija, sortiranje, filtriranje po statusu i pretraga
- Validacija na backendu (Bean Validation) i frontendu (Reactive Forms)
- Globalno rukovanje greškama (`@RestControllerAdvice`)
- Dashboard sa statistikom po statusima
- Unit testovi (JUnit 5 + Mockito, Jasmine)
- Swagger UI, Docker Compose

## Pokretanje (razvoj)

Potrebno: JDK 17+, Node.js 20+, MySQL (npr. XAMPP).

1. Pokreni MySQL u XAMPP-u (Start kod MySQL).
2. Backend: otvori folder `backend` u IntelliJ-u, pokreni `JobTrackerApplication`.
   API: http://localhost:8080, Swagger: http://localhost:8080/swagger-ui.html
3. Frontend:
   ```
   cd frontend
   npm install
   npm start
   ```
   Aplikacija: http://localhost:4200

Test nalog sa ulogom ADMIN pravi se automatski: `admin` / `admin123`.

## Pokretanje preko Dockera
```
docker compose up --build
```
Aplikacija: http://localhost:4200

## Testovi
```
cd backend && mvn test
cd frontend && npm test
```

## API (skraćeno)
| Metoda | Putanja | Opis |
|---|---|---|
| POST | /api/auth/register | registracija |
| POST | /api/auth/login | prijava, vraća JWT |
| GET/POST | /api/companies | lista / nova firma |
| PUT/DELETE | /api/companies/{id} | izmena / brisanje |
| GET | /api/applications?page&size&sortBy&direction&status&search | lista sa paginacijom |
| GET | /api/applications/stats | broj prijava po statusu |
| POST | /api/applications | nova prijava |
| GET/PUT/DELETE | /api/applications/{id} | detalji / izmena / brisanje |
| GET | /api/admin/users | samo ADMIN |

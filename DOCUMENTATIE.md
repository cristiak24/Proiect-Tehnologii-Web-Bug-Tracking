# Documentație Proiect - Bug Tracker Premium

## 1. Introducere
Această aplicație este o platformă modernă de **Bug Tracking** (urmărire a problemelor software), destinată echipelor de dezvoltare. Permite gestionarea proiectelor, raportarea bug-urilor, asignarea sarcinilor și colaborarea prin comentarii.

Aplicația este construită ca un **Single Page Application (SPA)** folosind **React** pentru interfață și **Node.js/Express** pentru backend, având un design "Premium" (Glassmorphism).

## 2. Arhitectură Tehnică

### Backend (Node.js + Express)
Backend-ul este structurat modular pentru a respecta principiile **Clean Code**.
- **Server**: `server.js` este punctul de intrare, dar logica este delegată către rute.
- **Bază de Date**: `sqlite3` cu ORM-ul **Sequelize**.
- **Rute**:
    - `/api/auth` - Autentificare (Login/Register).
    - `/api/projects` - Gestionare proiecte (CRUD, Join).
    - `/api/bugs` - Raportare și actualizare bug-uri.
    - `/api/comments` - Sistem de discuții pe bug-uri.
    - `/api/github` - Proxy pentru API-ul GitHub (ascunde token-urile de client).

### Frontend (React + Vite)
Interfața este construită din componente modulare și folosește `react-router-dom` pentru navigație.
- **Design**: CSS personalizat cu variabile (`index.css`) pentru tema Dark/Glass.
- **Componente Cheie**:
    - `Dashboard`: Lista de proiecte și statistici rapide.
    - `ProjectDetails`: Pagina principală a unui proiect (Bug-uri, GitHub Stats).
    - `CommentsSection`: Componentă reutilizabilă pentru chat.
    - `AddBugModal`: Formular modal pentru raportare.

## 3. Baza de Date (Schema)

| Model | Descriere | Relații |
| :--- | :--- | :--- |
| **User** | Utilizatorii aplicației (MP sau TST). | Are multe Proiecte și Bug-uri. |
| **Project** | Proiectele gestionate. | Are mulți Membri și Bug-uri. |
| **ProjectMember** | Tabelă de legătură (Many-to-Many). | Leagă User de Project + Rol (MP/TST). |
| **Bug** | Problemele raportate. | Aparține unui Proiect și Raportor. |
| **Comment** | Discuții pe marginea unui bug. | Aparține unui Bug și User. |

## 4. Funcționalități Cheie

### 🛡️ Roluri și Permisiuni
- **Manager Proiect (MP)**:
    - Poate marca bug-urile ca **Resolved**.
    - Poate prelua bug-uri (**Assign to Me**).
    - Vede întreaga echipă a proiectului.
- **Tester (TST)**:
    - Raportează bug-uri noi.
    - Verifică bug-urile rezolvate (**Verify & Close**) sau le redeschide (**Re-Open**).

### 🚀 Integrare GitHub
Backend-ul acționează ca un proxy pentru a prelua date live despre repository-ul asociat (Stele, Fork-uri) fără a expune chei API în browser (CORS safety).

### 👥 Vizualizare Echipă (Nou)
În pagina de detalii, poți apăsa pe butonul **"Vezi Echipa"** pentru a lista toți membrii proiectului, împărțiți în Manageri și Testeri.

### 💬 Sistem de Comentarii
Fiecare bug are o secțiune de discuții unde membrii echipei pot colabora pentru a clarifica problemele, extinzibilă din lista de bug-uri.

## 5. Ghid de Instalare și Rulare

### Cerințe
- Node.js instalat.

### Pasul 1: Backend
```bash
cd Backend
npm install
node server.js
```
Serverul va porni pe `http://localhost:3000`. Baza de date `bugtracker.db` se va crea automat.

### Pasul 2: Frontend
```bash
cd frontend-react
npm install
npm run dev
```
Aplicația va fi accesibilă la `http://localhost:5173`.

## 6. API Endpoints Principale

- `POST /api/register` - Înregistrare utilizator.
- `GET /api/projects` - Toate proiectele (cu statistici incluse).
- `POST /api/projects` - Creare proiect nou.
- `POST /api/projects/join-code` - Alăturare prin cod unic.
- `GET /api/projects/:id` - Detalii complete proiect.
- `POST /api/bugs` - Raportare bug.
- `POST /api/comments` - Adăugare comentariu.

---
*Documentație generată automat pentru proiectul Bug Tracking.*

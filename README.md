# Alexandria | Library Management System

![Banner](https://img.shields.io/badge/Alexandria-Library_System-1B263B?style=for-the-badge&logo=googlescholar&logoColor=E0A458)

**Alexandria** is a modern, sophisticated Library Management System designed with an elegant academic aesthetic. Built with a full-stack Node.js/React architecture and SQLite persistence.

## 🏛️ Core Features

- **User Authentication**: Secure Login & Registration with JWT (Admin & Member roles).
- **Book Management**: Full CRUD operations for books (Admin only).
- **Borrowing Engine**: Check out books, automated due dates, and return tracking.
- **Search & Filter**: Real-time catalogs with title and genre filtering.
- **Modern UI**: Dark-themed or light-themed aesthetics including glassmorphism.

## 🎨 Branding (Alexandria)

- **Primary**: Oxford Blue (#1B263B)
- **Secondary**: Ink Blue (#415A77)
- **Accent**: Vintage Gold (#E0A458)
- **Background**: Ghost White (#F8F9FA)

## 🚀 Deployment

The project is optimized for a unified deployment on **Vercel** with a persistent **PostgreSQL** database.

### Unified Mono-deployment
The project uses a `vercel.json` configuration to host the React frontend and Node.js Express API under the same domain.

### Database (Supabase)
For persistent storage in production, the system automatically switches to **PostgreSQL** when a `DATABASE_URL` environment variable is provided. Locally, it uses **SQLite** for zero-config development.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios, React Router.
- **Backend**: Node.js, Express, JWT, BcryptJS.
- **Database**: 
  - **Production**: PostgreSQL (Supabase/Neon).
  - **Development**: SQLite (Local file).
- **Deployment**: Vercel (Unified Monorepo).

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/InukaWijerathna/Alexandria.git
   cd Alexandria
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```

### Development
Run both servers concurrently:
```bash
npm run dev
```

---

## 📄 License
MIT

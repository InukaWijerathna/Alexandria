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

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/InukaWijerathna/Alexandria.git
   cd Alexandria
   ```
2. Install dependencies for all parts:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Development
Run both servers concurrently:
```bash
npm run dev
```

### Production Build & Deployment
Build the frontend and run the production server:
```bash
npm run build
npm start
```

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Axios, React Router, Vanilla CSS.
- **Backend**: Node.js, Express, SQLite, JWT, BcryptJS.
- **Database**: SQLite (Automated table creation).

## 📄 License
MIT

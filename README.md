<p align="center">
  <img src="https://img.shields.io/badge/JurisNode-AI%20Legal%20Platform-6366f1?style=for-the-badge&logo=scales&logoColor=white" />
</p>

<h1 align="center">⚖️ JurisNode</h1>
<h3 align="center">AI-Powered Legal Navigation Platform for India</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🚀 Overview

**JurisNode** is an AI-powered legal navigation platform designed to bridge the justice gap in India. It empowers citizens — especially in rural and underserved communities — to understand their legal rights, navigate complex procedures, and connect with verified lawyers across jurisdictions.

### The Problem
- **70%** of India's population lacks access to affordable legal guidance
- Legal procedures are complex, vary by state, and are often in English
- Finding the right lawyer across jurisdictions is nearly impossible for common citizens

### Our Solution
JurisNode provides:
- 🤖 **AI Legal Navigator** — Procedural guidance powered by an intelligent classification engine
- 📋 **Step-by-step procedures** — Time-sensitive actions with urgency indicators
- ⚖️ **Lawyer Discovery** — Search & assign lawyers by state, specialization, and experience
- 📄 **Document Management** — Upload, track, and manage case documents
- 📅 **Case Timeline** — Complete audit trail of every case event

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth System** | JWT-based registration & login with role-based access (Citizen / Lawyer) |
| 📝 **Case Management** | Create, track, and manage legal cases with category classification |
| 🤖 **AI Chat** | Real-time AI guidance with typing indicators and formatted responses |
| 🧠 **Auto AI Guidance** | Automatic procedural analysis triggered on case creation |
| ⚖️ **Lawyer Search** | Filter by state, specialization, experience; one-click assignment |
| 📄 **Document Upload** | Drag-and-drop file uploads with case-specific storage |
| 📅 **Timeline** | Chronological event tracking for complete case history |
| 🔔 **Toast Notifications** | Elegant slide-in notifications replacing browser alerts |
| 📊 **Dashboard** | Role-specific views with pending assignments and case overview |

---

## 🏗️ Tech Stack

```
Frontend:    Next.js 16 (App Router) + React 19
Styling:     Vanilla CSS with custom design system
Backend:     Next.js API Routes (Node.js)
Database:    SQLite via Prisma ORM
Auth:        JWT (jsonwebtoken + bcryptjs)
AI Engine:   Custom rule-based classification + guidance engine
```

---

## 📁 Project Structure

```
jurisnode/
├── app/
│   ├── api/
│   │   ├── ai/chat/          # AI chat endpoint
│   │   ├── auth/             # Login & Register
│   │   ├── cases/            # CRUD + assign + chat + documents + timeline
│   │   ├── categories/       # Legal categories
│   │   └── lawyers/          # Search + assignments
│   ├── cases/                # Case detail & new case pages
│   ├── dashboard/            # User dashboard
│   ├── lawyers/              # Lawyer search page
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── globals.css           # Design system & styles
│   ├── layout.js             # Root layout
│   └── page.js               # Landing page
├── components/
│   ├── ClientLayout.js       # Auth + Toast providers
│   ├── Navbar.js             # Navigation bar
│   └── Toast.js              # Toast notification system
├── lib/
│   ├── ai-engine.js          # AI classification & guidance
│   ├── auth.js               # JWT utilities
│   ├── AuthContext.js         # React auth context
│   └── prisma.js             # Prisma client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Seed data (categories, sample users)
└── public/                   # Static assets
```

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** 18+ 
- **npm** 9+

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Gpar377/jurisnode.git
cd jurisnode

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your JWT_SECRET

# 4. Initialize database
npx prisma generate
npx prisma db push
npm run seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |

---

## 📸 Legal Categories Covered

| Category | Icon | Key Procedures |
|----------|------|----------------|
| Criminal Law | 🔴 | FIR filing, bail, chargesheet |
| Family Law | 👨‍👩‍👧 | Divorce, custody, maintenance |
| Property & Land | 🏠 | Title disputes, encroachment, registration |
| Consumer Rights | 🛒 | Product complaints, deficiency of service |
| Labour & Employment | 👷 | Wage disputes, wrongful termination |
| Cyber Crime | 💻 | Online fraud, data theft, harassment |
| Constitutional Rights | 📜 | Fundamental rights, PIL, RTI |
| Banking & Finance | 🏦 | Loan disputes, insurance claims |
| Tenant & Rental | 🏢 | Eviction, rent disputes |

---

## 🔒 Security

- Passwords hashed with **bcryptjs**
- JWT tokens with configurable expiry
- Role-based API authorization
- Input validation on all endpoints
- `.env` excluded from version control

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built for **AI for Bharat** — bridging the legal justice gap with AI.

| Role | Name |
|------|------|
| Developer | [@Gpar377](https://github.com/Gpar377) |

---

<p align="center">
  <strong>⚖️ JurisNode — Navigate any legal situation with confidence</strong>
</p>

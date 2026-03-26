# Mercado no Castelo - PRD (Product Requirements Document)

## Original Problem Statement
Build a complete management platform for "Mercado no Castelo" - a Portuguese artisanal market event based in Northern Portugal (Braga region), founded in 2022. The platform uses the official branding and content from mercadonocastelo.pt.

## About the Event
- **Founded:** 2022 by a group of friends with diverse backgrounds
- **Mission:** Create a space where design, entrepreneurship and sustainability meet
- **Focus:** Smart buying - durable products made in fair conditions
- **Location:** Historic and inspiring locations in Northern Portugal (Braga, Porto)
- **Categories:** Moda, Decoração, Alimentação, Lifestyle

## User Personas
1. **Admin/Curator** - Event organizers who manage applications, approve brands, track logistics
2. **Brand Owner** - Artists and entrepreneurs who want to participate in the market

## Core Requirements (Static)
- Multi-user authentication (JWT + Google OAuth)
- Role-based access control (Admin vs Brand)
- Application submission workflow
- AI-powered application analysis
- Contract and payment tracking
- Logistics management
- Communication history tracking
- Sustainability scoring
- Social media tracking
- Sponsor/fiscal management

## What's Been Implemented (26 Mar 2025)

### Backend (FastAPI + MongoDB)
- Complete authentication system (JWT + Emergent Google OAuth)
- All CRUD APIs for 7 modules:
  - Candidaturas (Applications)
  - Marcas Aprovadas (Approved Brands)
  - Logística (Logistics)
  - Comunicação (Communications)
  - Sustentabilidade (Sustainability)
  - Social Media
  - Patrocinadores (Sponsors)
- Dashboard statistics API
- AI analysis integration with Claude Sonnet 4.5
- Approval workflow for candidaturas

### Frontend (React + Tailwind + Shadcn UI)
- Landing page with hero section and CTAs
- Authentication pages (Login/Register with JWT + Google)
- Admin Dashboard with KPI cards and charts
- All 7 admin management pages
- Brand Portal for application submission
- Earthy/terracotta color palette as per design guidelines

## Technology Stack
- Frontend: React 18, Tailwind CSS, Shadcn UI, Phosphor Icons, Recharts
- Backend: FastAPI, Motor (async MongoDB), PyJWT, bcrypt
- Database: MongoDB
- AI: Claude Sonnet 4.5 via Emergent Integrations
- Auth: JWT + Emergent Google OAuth

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Application submission
- [x] Admin dashboard
- [x] All management modules

### P1 (High Priority) - Future
- [ ] Email notifications via SendGrid/Resend
- [ ] File upload for contracts/materials (Object Storage)
- [ ] Export reports to PDF/Excel
- [ ] Bulk application import from CSV

### P2 (Medium Priority) - Future
- [ ] Calendar integration for event scheduling
- [ ] WhatsApp/SMS notifications
- [ ] Public event page
- [ ] Real-time notifications

### P3 (Nice to Have) - Future
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Multi-language support (PT/EN)
- [ ] Analytics dashboard improvements

## Test Credentials
- Admin: admin@mnc.pt / Admin123!
- Brand: marca@test.pt / Marca123!

## API Endpoints Overview
All endpoints are prefixed with `/api/`
- Auth: `/auth/register`, `/auth/login`, `/auth/session`, `/auth/me`, `/auth/logout`
- Dashboard: `/dashboard/stats`
- Candidaturas: `/candidaturas` (CRUD + analyze + approve)
- Marcas: `/marcas` (Read + Update)
- Logística: `/logistica` (CRUD)
- Comunicação: `/comunicacao` (Read + Create)
- Sustentabilidade: `/sustentabilidade` (CRUD)
- Social Media: `/socialmedia` (CRUD)
- Patrocinadores: `/patrocinadores` (CRUD)

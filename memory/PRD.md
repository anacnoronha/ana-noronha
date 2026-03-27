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

## What's Been Implemented

### 27 Mar 2025 - Bulk Email & Payment Management
- **Bulk Email Functionality**:
  - New "Enviar Emails em Massa" button in Candidaturas page
  - Modal showing pending approval emails count
  - Preview of brands to receive emails
  - One-click bulk send with automatic email_confirmado update
  - Enhanced approval email template with IBAN and payment details
- **Imported real data from Excel files** (BD_UPDATE_12ED.xlsx & BD_UPDATE_13ed.xlsx):
  - Payment statuses (Por Pagar, Recusado p/Mc) for 72 candidaturas
  - Email confirmation status (36 brands with email already sent)
- **Updated Pricing Table** with real values from Excel:
  - 12.ª Edição - Espaço Base: 467.40€
  - 13.ª Edição - Zona Exterior: 467.40€
  - 13.ª Edição - Zona Interior: 430.50€
  - 12.ª + 13.ª Edição - Zona Exterior: 888.06€
  - 12.ª + 13.ª Edição - Zona Interior: 853.01€
- **Added Payment Management in UI**:
  - Inline dropdown to change payment status directly in table
  - Payment filter to view "Por Pagar", "Pago", "Recusado"
  - Stats cards showing payment counts
- **Added Email Confirmation Tracking**:
  - Toggle button to mark emails as sent/not sent
  - Visual indicator (green check) for confirmed emails
  - `email_confirmado` field added to Candidatura model

### 26 Mar 2025 - Initial Build
- Complete authentication system (JWT + Emergent Google OAuth)
- All CRUD APIs for 7 modules
- AI analysis integration with Claude Sonnet 4.5
- Admin Dashboard with KPI cards
- Brand Portal for application submission

## Technology Stack
- Frontend: React 18, Tailwind CSS, Shadcn UI, Phosphor Icons, Recharts
- Backend: FastAPI, Motor (async MongoDB), PyJWT, bcrypt
- Database: MongoDB
- AI: Claude Sonnet 4.5 via Emergent Integrations
- Auth: JWT + Emergent Google OAuth
- Email: Resend API (configured but custom templates pending)

## Data Summary
- **72 candidaturas** imported from real Excel data
- **36 approved**, **23 rejected**, **13 waitlist**
- **61 "Por Pagar"**, **11 "Recusado p/Mc"**
- **36 emails already sent** (email_confirmado=true)
- **5 price options** in tabela_precos

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Application submission
- [x] Admin dashboard
- [x] All management modules
- [x] Real data import from Excel
- [x] Payment status management
- [x] Email confirmation tracking
- [x] Pricing table with real values

### P1 (High Priority) - DONE
- [x] Custom email templates integration with Resend (enhanced with IBAN, prices, payment details)
- [x] Bulk email sending functionality

### P2 (Medium Priority) - Future
- [ ] File upload for contracts/materials
- [ ] Export reports to PDF/Excel
- [ ] Calendar integration for event scheduling

### P3 (Nice to Have) - Future
- [ ] Mobile responsive improvements
- [ ] Multi-language support (PT/EN)
- [ ] Analytics dashboard improvements

## Test Credentials
- Admin: admin@mnc.pt / Admin123
- Brand: marca@test.pt / Marca123

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
- Preços: `/precos` (Read), `/precos/all` (Admin)
- Email: `/email/send`, `/email/pending-approval`, `/email/bulk-send`

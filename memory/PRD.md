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

## Current Platform Status (27 Mar 2025)

### ✅ FULLY FUNCTIONAL
| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ | JWT + Google OAuth |
| Dashboard | ✅ | KPIs, charts, statistics |
| Candidaturas | ✅ | 72 real applications imported |
| Gestão de Pagamento | ✅ | Inline dropdown, filters |
| Email Tracking | ✅ | Toggle button, bulk send |
| Tabela de Preços | ✅ | 5 real prices |
| Marcas Aprovadas | ✅ | 3 brands |
| Logística | ✅ | 3 records |
| Comunicação | ✅ | 3 records |
| Sustentabilidade | ✅ | 4 records |
| Social Media | ✅ | 3 records |
| AI Analysis | ✅ | Claude Sonnet 4.5 |
| Email Templates | ✅ | IBAN: PT50 0023 0000 4562 4816 3089 4 |
| **Upload Materiais** | ✅ | Comprovativo, Logótipo, Fotos (Portal Marca) |

### 📊 CURRENT DATA
- **72 candidaturas** (36 aprovadas, 23 rejeitadas, 13 lista espera)
- **61 por pagar**, 0 pagos
- **36 emails enviados**, 1 pendente
- **56 na 12ª Ed.**, 52 na 13ª Ed.
- **0 patrocinadores** (confirmado pelo utilizador)

### ⚠️ NEEDS DATA/CONTENT
| Item | Status | Action Required |
|------|--------|-----------------|
| Patrocinadores | Vazio | Aguardar confirmações reais |
| Dados de Faturação | Parcial | NIFs/Moradas nos Excel (separador "faturação") |

### 🔜 NEXT FEATURES (P2)
- [ ] Exportação PDF/Excel de relatórios
- [ ] Notificações WhatsApp/SMS
- [ ] Página pública do evento
- [ ] Importar dados de faturação (NIFs/Moradas) dos Excel

## Technology Stack
- Frontend: React 18, Tailwind CSS, Shadcn UI, Phosphor Icons, Recharts
- Backend: FastAPI, Motor (async MongoDB), PyJWT, bcrypt
- Database: MongoDB
- AI: Claude Sonnet 4.5 via Emergent Integrations
- Auth: JWT + Emergent Google OAuth
- Email: Resend API

## Test Credentials
- Admin: admin@mnc.pt / Admin123
- Brand: marca@test.pt / Marca123

## API Endpoints
All endpoints prefixed with `/api/`:
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
- Upload: `/upload/comprovativo/{id}`, `/upload/logotipo/{id}`, `/upload/fotos/{id}`
- Materiais: `/candidatura/{id}/materiais`, `/uploads/{filename}`

## Payment Details (for emails)
- **IBAN:** PT50 0023 0000 4562 4816 3089 4
- **Titular:** Ana Noronha

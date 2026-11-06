# Bossfemm: Sample User Profiles & Bilingual Seed Data Localization

## Executive Summary
This update fully localizes all mock user accounts (Employee, HR Leader, System Administrator), sample anonymous employee whistleblowing tickets, AI triage assessments, and two-way leadership dialogue threads into high-standard English (DEI & Equal Pay terminology) while seamlessly maintaining Azerbaijani when the language toggle is switched to `AZ`.

---

## User Review & Confirmed Choices

> [!IMPORTANT]
> The following requirements have been confirmed via interactive clarification:
> - **All Mock Accounts & Personas**: Employee, HR Leadership, and Admin roles will have internationalized English titles and personas (`Sarah Jenkins / Staff Software Engineer`, `Chief People Officer / HR Lead`, `System Administrator`).
> - **Bilingual Seed Tickets & Dialogue**: All sample employee reviews, AI risk analysis summaries, mitigation steps, and leadership message threads will dynamically render in English or Azerbaijani based on the active language switcher.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Provides natural, professional English personas and sample whistleblowing cases reflecting real-world corporate DEI scenarios (maternity leave transition, equal pay audit, promotion glass ceiling).
  - Keeps all mock data synchronized with the active language switcher (`EN` default / `AZ` toggle).
- **Target Audience**:
  - Global enterprise compliance teams, HR leaders, and employees evaluating Bossfemm's confidential reporting and AI triage workflows in English.

---

## 2. User Experience & Visual Design

- **Navigation & Role Switcher Header**:
  - When in `EN`: Shows `Sarah Jenkins (Senior Staff Engineer)`, `Chief People Officer (Tech Solutions)`, `System Administrator`.
  - When in `AZ`: Shows `Mübariz Şahbazlı (Baş Mühəndis)`, `HR Rəhbəri (Tech Solutions)`, `Sistem Administratoru`.
- **Anonymous Tracking Ticket Modal & Dialogue Threads**:
  - When opening demo tokens (`BF-79X-ZK9A`, `BF-34K-PAY2`, `BF-91M-SAFE`), the ticket text, AI executive summary, mitigation recommendations, and chat bubble dialogue seamlessly display in English with verified DEI terminology.
- **Leadership Alert Triage Kanban**:
  - Priority alerts display English category badges (`Equal Pay Audit`, `Maternity & Flexible Hours`, `Executive Glass Ceiling & Promotion`) with English SLA indicators (`72h SLA`, `24h Critical SLA`).

---

## 3. Key Product Decisions & Trade-Offs

- **Bilingual Dual-Field Seed Structure vs. Separate Databases**:
  - *Chosen Approach*: Store both `en` and `az` fields on review documents, user profiles, and dialogue messages (e.g. `text_en`, `text_az`, `aiExecutiveSummary_en`, `aiExecutiveSummary_az`, `dialogue_en`, `dialogue_az`).
  - *Why*: Enables instant, flicker-free switching between English and Azerbaijani using the existing client-side `lang` state without requiring page reload or separate database instances.

---

## 4. Technical Architecture & Component Mapping

```
┌──────────────────────────────────────────────────────────────┐
│                    Bossfemm Applet                           │
│  useAuthStore (lang: 'en' | 'az') ── Top Navigation Bar       │
└───────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│  Employee Portal & Tracking     │   │  Leadership Alert Triage Hub     │
│  - Sarah Jenkins (EN) /         │   │  - Chief People Officer (EN) /   │
│    Mübariz Şahbazlı (AZ)        │   │    HR Rəhbəri (AZ)               │
│  - English & AZ encrypted r1/r2 │   │  - AI Risk Escalation in EN/AZ   │
│  - 2-Way Anonymous Dialogue     │   │  - Action Plan & SLA in EN/AZ    │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

### Components to Update:
1. `server.ts`:
   - Add bilingual user metadata (`name_en`, `name_az`, `title_en`, `title_az`, `workHistory_en`, `workHistory_az`).
   - Add bilingual fields for `r1`, `r2`, `r3` in `DB.reviews` (English text, categories, AI executive summaries, mitigation steps, and dialogue arrays).
2. `src/components/AnonymousTrackingModal.tsx`:
   - Render localized ticket descriptions, status notes, AI recommendations, and chat messages based on `lang === 'en'`.
3. `src/components/EmployerDashboard.tsx`:
   - Render localized categories, employee issue descriptions, and dialogue messages in the leadership triage feed.
4. `src/components/EmployeeDashboard.tsx`:
   - Display English user profile info, mock company title, and sample submission history.
5. `src/App.tsx`:
   - Render localized role titles in the header and mobile navigation drawer.

---

## 5. Verification Plan
1. **Compilation & Type Check**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript errors.
2. **Language Switch Verification**:
   - Toggle between `EN` and `AZ` in the top bar.
   - Verify sample users (`Sarah Jenkins` in EN vs `Mübariz Şahbazlı` in AZ; `Chief People Officer` in EN vs `HR Rəhbəri` in AZ).
   - Open the Secret Receipt Key tracker and check demo tokens (`BF-79X-ZK9A`, `BF-34K-PAY2`, `BF-91M-SAFE`) to confirm all ticket texts, AI summaries, and two-way dialogues render in professional English.

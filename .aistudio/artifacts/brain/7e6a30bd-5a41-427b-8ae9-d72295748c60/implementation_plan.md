# Bossfemm: Architecture Realignment Plan — Anonymous Encrypted Voice, AI Alert Triage & Leadership Resolution Lifecycle

## 1. Executive Summary & Core Objective
Based on user feedback, the primary value proposition of **Bossfemm** is shifting from a score-first directory to an **end-to-end encrypted anonymous whistleblowing and corporate resolution engine**:
- **Primary Pillar 1 (Zero-Knowledge Voice Vault)**: Employees report workplace challenges, bias, pay gaps, and harassment with client-side Web Crypto AES-GCM/RSA encryption, zero trace, zero metadata retention, and an anonymous cryptographic tracking token (`Secret Receipt Key`).
- **Primary Pillar 2 (Direct Categorized AI Alert Triage & Risk Escalation)**: The AI Agent automatically screens, decrypts on-the-fly inside secure enclaves, classifies into standard DEI/HR categories, computes a real-time Risk Escalation Score (Critical, High, Medium, Low), checks policy compliance, and routes prioritized alerts directly to company leadership.
- **Primary Pillar 3 (Executive Resolution Hub & Anonymous 2-Way Dialogue)**: Corporate leadership manages issues through an active Kanban triage with status lifecycles (`Reported & Encrypted` -> `AI Triaged & Escalated` -> `Leadership Assigned` -> `Action Plan Active` -> `Resolution Verified`). Leadership can communicate back to the anonymous employee via the cryptographic token channel without ever revealing their identity.
- **Secondary Role (FemPS Index)**: The Feminen Promoting Score (FemPS) is repositioned as a secondary, aggregated corporate health benchmark derived directly from resolution velocity, psychological safety, and leadership accountability.

---

## 2. Proposed Changes & Architecture Breakdown

### A. Homepage & Dual-Role Hero Architecture (`src/components/LandingPage.tsx`)
- **Dual-Role Hero Experience**:
  - Split interactive hero spotlighting the two core portals:
    1. **For Women & Employees**: *"Secure Anonymous Voice Vault"* — 100% confidential reporting, Zero-Knowledge client-side encryption, private tracking receipt.
    2. **For Corporate Leadership**: *"AI Alert Triage & Resolution Hub"* — Direct categorized escalation, automated risk grading, compliant resolution workflows.
- **Interactive Encryption & Anonymity Explainer**:
  - Visual breakdown of the Zero-Knowledge cryptographic barrier: Client-side AES-GCM 256-bit + RSA public key exchange -> Zero IP/Browser Fingerprinting -> AI Agent Enclave Processing -> Secure Leadership Delivery.
- **Repositioning FemPS Section**:
  - Move the FemPS Benchmark from primary focus to a dedicated "Corporate Benchmark & Transparency" tab and secondary section explaining how resolution efficiency feeds into the company's FemPS score.

### B. Anonymous Submission & Secret Receipt Token Engine (`src/components/EmployeeDashboard.tsx`, `PersonalFeedbackForm.tsx`)
- **Client-Side Cryptographic Token Generation**:
  - On submission, generate a unique Base58/Hex cryptographic tracking key (e.g., `BF-79X-ZK9A`) stored only with the employee.
- **Anonymous Tracking & Dialogue Portal**:
  - Add a "Track My Issue" tab where employees can enter their Secret Receipt Key without any login or account creation.
  - View real-time status of their report: `Encrypted Queue` -> `AI Escalated to Leadership` -> `Investigation & Action Plan` -> `Resolved`.
  - Secure two-way anonymous messaging: Leadership can post official status updates or ask non-identifying clarifying questions (e.g., "HR has scheduled an independent pay audit; would you like to review the audit scope?"), and the employee can reply anonymously.

### C. Direct Categorized AI Alert Triage & Risk Escalation (`server.ts`, `src/components/EmployerDashboard.tsx`)
- **Backend AI Pipeline & Risk Escalation Engine**:
  - Update Gemini AI analysis prompt to compute:
    1. `category`: Pay Disparity & Promotion, Harassment & Hostile Environment, Maternity & Caregiver Bias, Leadership Glass Ceiling, Retaliation Concerns.
    2. `riskLevel`: `CRITICAL` (Urgent legal/safety escalation, 24h SLA), `HIGH` (Systemic bias, 72h SLA), `MEDIUM` (Process/policy friction), `LOW` (Cultural suggestion).
    3. `riskScore`: Numeric score 1–100.
    4. `aiExecutiveSummary`: 2-sentence non-identifying briefing for executive board.
    5. `recommendedMitigationSteps`: Concrete corporate actions.
- **Leadership Dashboard UX Overhaul**:
  - Priority Alert Feed with color-coded risk tags, urgent escalation indicators, and SLA countdowns.
  - Active Lifecycle Stage Management: One-click status progression (`Triaged` -> `In Progress` -> `Remediation Deployed` -> `Closed`).
  - Anonymous Thread Console: Send encrypted updates directly to the employee's tracking token.
  - Impact on FemPS: Live preview showing how timely resolution improves the company's quarterly FemPS rating.

### D. Open-Source Benchmark & Badge (`src/components/BenchmarkLeaderboard.tsx`, `BadgeModal.tsx`)
- Keep the verified FemPS leaderboard and SVG embed badge as a public corporate incentive, clearly explaining: *"FemPS reflects genuine resolution speed, employee psychological safety, and verified equity practices."*

### E. Full Bilingual Coverage (`src/i18n.ts`)
- Seamless English (default) and Azerbaijani translation for all new components:
  - Cryptographic token terminology, tracking interface, AI risk triage headers, executive action buttons, and anonymous dialogue threads.

---

## 3. Verification & Testing Plan
1. **Compilation & Type Safety**:
   - Run `lint_applet` and `compile_applet` to ensure zero TypeScript errors or missing imports.
2. **Anonymous Submission & Token Test**:
   - Submit an encrypted issue from the Employee Voice Vault.
   - Verify that a Secret Receipt Key is generated.
   - Paste the token into the "Track Issue" tab and confirm full status visibility and anonymous reply functionality.
3. **AI Triage & Escalation Test**:
   - Verify risk escalation tags (Critical / High / Medium), automated category sorting, and executive mitigation recommendations in the Employer Dashboard.
4. **Resolution Tracking & FemPS Calculation**:
   - Update issue status to `Resolved` with resolution notes in the Leadership Hub.
   - Verify that the company's resolution rate and FemPS index dynamically update.
5. **Language Switch**:
   - Toggle EN/AZ across the new dual-role landing page, tracking modal, and triage board.

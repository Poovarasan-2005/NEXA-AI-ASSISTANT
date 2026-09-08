# NEXA AI ASSISTANT

> **Sovereign, Hardened, Multimodal Personal AI Operating System**  
> Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Prisma ORM.

---

## 🌟 Key Features

- 🛡️ **AI Governance & Constitution Engine**: Cryptographic action contracts, policy enforcement, explainability ledger, and dry-run simulations.
- 🧠 **Multi-Tier Memory Architecture**: Semantic, episodic, working, and core memory systems with audit trails.
- 🎨 **Multimodal Generation Studio**:
  - AI Image Generation & Diffusion Studio
  - Visual Workflow Builder (interactive step-by-step orchestrator)
  - Data Studio & Dynamic Chart Profiler
  - Real-time Architecture & Sequence Diagram Generator (Mermaid)
  - Multi-format Document Exporters (PDF with security stamps, XLSX, DOCX, PPTX, CSV)
- 🔒 **Zero-Trust Security & RBAC**:
  - Role-Based Access Control (Admin, User, Auditor, Developer)
  - Session management with revocation and MFA verification
  - Tamper-evident, HMAC-signed security audit logging
  - Human-in-the-loop approval firewall for high-risk actions
- ⚡ **Multi-Model Orchestrator**: Supports OpenAI, Anthropic, Gemini, or sovereign high-fidelity simulation mode when running without external API keys.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/Poovarasan-2005/NEXA-AI-ASSISTANT.git
cd NEXA-AI-ASSISTANT
npm install
```

### 3. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```

### 4. Database Setup & Seed
Initialize the SQLite database with the pre-configured governance rules, tools, and demo accounts:
```bash
npm run db:push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@nexa.ai` | `AdminPassword123!` | Full governance, security center, audit ledger, and user management |
| **Standard User** | `user@nexa.ai` | `UserPassword123!` | Autonomous chat, memory engine, workflows, documents, data studio |

---

## 🧪 Master Test Suite

Run the full end-to-end red-team and verification suite:
```bash
npx tsx scripts/test-master.ts
```

All 82 checks across 5 milestone phases and security suites verify automatically.

---

## 📄 License
MIT License

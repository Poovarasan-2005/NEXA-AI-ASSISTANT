export type DiagramType = "ARCHITECTURE" | "FLOWCHART" | "SEQUENCE" | "ERD" | "MINDMAP";

export interface DiagramResult {
  id: string;
  title: string;
  type: DiagramType;
  mermaidCode: string;
  svgMarkup: string;
  description: string;
}

export function generateDiagram(type: DiagramType, customPrompt?: string): DiagramResult {
  const id = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (type) {
    case "FLOWCHART":
      return {
        id,
        title: customPrompt || "Zero-Trust Human Approval & Constitution Flowchart",
        type,
        description: "Execution lifecycle showing AI Constitution pre-check, risk rating, and Human Approval Firewall interception.",
        mermaidCode: `graph TD
    A([User Task Request]) --> B[Personal AI Mode Selector]
    B --> C{AI Constitution Policy Firewall}
    C -->|Rule Violation Detected| D[BLOCKED: Intercept & Log Alert]
    C -->|Compliant| E[Action Contract Generation]
    E --> F{Risk Evaluation Engine}
    F -->|Risk Level: HIGH / CRITICAL| G[PAUSED: Human Approval Barrier]
    G -->|User Rejects| H([Execution Terminated])
    G -->|User Approves| I[Tool Execution Sandbox]
    F -->|Risk Level: LOW / MEDIUM| I
    I --> J[Cryptographic Verification & Scrubbing]
    J --> K[Record Decision Ledger]
    K --> L([Deliver Verified Artifact / Result])
    
    style C fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#fff
    style G fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style I fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    style K fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff`,
        svgMarkup: generateFlowchartSvg(),
      };

    case "SEQUENCE":
      return {
        id,
        title: customPrompt || "Multi-Model Orchestration & Verification Sequence",
        type,
        description: "Interaction sequence between User, Orchestrator, Constitution, Sub-Agents, Tools, and Decision Ledger.",
        mermaidCode: `sequenceDiagram
    autonumber
    actor User
    participant Orch as Orchestrator
    participant Const as Constitution Engine
    participant Agent as Planner Sub-Agent
    participant Firewall as Approval Firewall
    participant Tool as Tool Sandbox
    participant Ledger as Decision Ledger

    User->>Orch: Submit Goal & Mode
    Orch->>Const: Check Baseline Policies (7 Rules)
    Const-->>Orch: Policy Verified (Compliant)
    Orch->>Agent: Generate Plan & Action Contract
    Agent-->>Orch: Plan: Steps [1..N] (Risk: HIGH)
    Orch->>Firewall: Intercept High-Risk Operation
    Firewall->>User: Request Cryptographic Authorization
    User-->>Firewall: Grant Permission
    Firewall-->>Orch: Authorization Token Validated
    Orch->>Tool: Execute Isolated Tool Step
    Tool-->>Orch: Raw Output Payload
    Orch->>Ledger: Commit Trace (Memories, Rules, Models)
    Orch->>User: Deliver Zero-Trust Verified Response`,
        svgMarkup: generateSequenceSvg(),
      };

    case "ERD":
      return {
        id,
        title: customPrompt || "NEXA Sovereign Data & Lineage Entity Relationship Diagram",
        type,
        description: "Entity relationships across User, Tasks, ActionContracts, DecisionLedgers, Artifacts, and Memory Vectors.",
        mermaidCode: `erDiagram
    USER ||--o{ TASK : dispatches
    USER ||--o{ MEMORY : owns
    USER ||--o{ ARTIFACT : generates
    USER ||--o{ CONSTITUTION_RULE : ratifies
    TASK ||--|| ACTION_CONTRACT : binds
    TASK ||--|| DECISION_LEDGER : records
    TASK ||--o{ TOOL_EXECUTION : runs
    ARTIFACT ||--o{ ARTIFACT : lineage_parent_child
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ ARTIFACT : manages`,
        svgMarkup: generateErdSvg(),
      };

    case "ARCHITECTURE":
    default:
      return {
        id,
        title: customPrompt || "NEXA AI Sovereign Operating System Architecture",
        type: "ARCHITECTURE",
        description: "Full-stack multi-layer architecture diagram illustrating the sovereign governance mesh and multimodal studio.",
        mermaidCode: `graph TB
    subgraph UI ["User Experience Layer"]
      CC["Command Center"]
      CHAT["Multimodal Chat Workspace"]
      CONST_UI["Constitution Lab"]
      STUDIO["Document & Visual Studio"]
      GRAPH_UI["Artifact Lineage Hub"]
    end

    subgraph GOV ["Governance & Policy Mesh"]
      CONST_ENG["AI Constitution Engine"]
      FIREWALL["Human Approval Firewall"]
      CONTRACT["Action Contract Generator"]
      ROUTER["Personal AI Mode Router"]
    end

    subgraph ORCH ["Cognitive Orchestration Engine"]
      PLANNER["Goal Planner Agent"]
      REASONER["Multi-Model Router (Sonnet / GPT-4o / Nexa)"]
      LEDGER["Explainable Decision Ledger"]
      VERIFIER["Zero-Trust Verifier & Scrubber"]
    end

    subgraph STUDIO_SYS ["Multimodal Creation Studio"]
      DOCX_GEN["DOCX Executive Briefs"]
      PPTX_GEN["PPTX Presentation Decks"]
      XLSX_GEN["XLSX Multi-Sheet Workbooks"]
      IMG_GEN["Neural Image Studio"]
      DIAG_GEN["Mermaid & SVG Diagrams"]
    end

    subgraph DATA ["Sovereign Knowledge Vault"]
      MEM["8-Tier Memory Vectors"]
      ARTIFACTS["Connected Artifact Graph"]
      AUDIT["Tamper-Evident Audit Vault"]
    end

    UI --> GOV
    GOV --> ORCH
    ORCH --> STUDIO_SYS
    ORCH --> DATA
    STUDIO_SYS --> ARTIFACTS`,
        svgMarkup: generateArchitectureSvg(),
      };
  }
}

// Visual SVG Renderers
function generateArchitectureSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Title Header -->
  <text x="30" y="40" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold" letter-spacing="2">SYSTEM ARCHITECTURE // NEXA SOVEREIGN OS</text>
  <text x="30" y="65" fill="#ffffff" font-size="18" font-weight="bold">Multi-Agent Governance &amp; Multimodal Execution Architecture</text>

  <!-- Layer 1: UX Layer -->
  <g transform="translate(30, 90)">
    <rect width="840" height="70" rx="8" fill="#101726" stroke="#1e293b" stroke-width="1.5"/>
    <text x="15" y="22" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold">LAYER 1: USER EXPERIENCE &amp; WORKSPACES</text>
    <rect x="15" y="32" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="90" y="50" fill="#f8fafc" font-size="11" text-anchor="middle">Command Center</text>
    <rect x="180" y="32" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="255" y="50" fill="#f8fafc" font-size="11" text-anchor="middle">Chat Workspace</text>
    <rect x="345" y="32" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="420" y="50" fill="#f8fafc" font-size="11" text-anchor="middle">AI Constitution Lab</text>
    <rect x="510" y="32" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="585" y="50" fill="#f8fafc" font-size="11" text-anchor="middle">Multimodal Studio</text>
    <rect x="675" y="32" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="750" y="50" fill="#f8fafc" font-size="11" text-anchor="middle">Artifact Lineage Hub</text>
  </g>

  <!-- Connectors -->
  <line x1="450" y1="160" x2="450" y2="185" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4"/>

  <!-- Layer 2: Governance Mesh -->
  <g transform="translate(30, 185)">
    <rect width="840" height="70" rx="8" fill="#101726" stroke="#0891b2" stroke-width="1.5"/>
    <text x="15" y="22" fill="#06b6d4" font-size="10" font-family="monospace" font-weight="bold">LAYER 2: ZERO-TRUST GOVERNANCE &amp; POLICY FIREWALL</text>
    <rect x="15" y="32" width="190" height="28" rx="6" fill="#0c4a6e" stroke="#0284c7"/>
    <text x="110" y="50" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">AI Constitution (7 Rules)</text>
    <rect x="220" y="32" width="190" height="28" rx="6" fill="#7f1d1d" stroke="#dc2626"/>
    <text x="315" y="50" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">Human Approval Firewall</text>
    <rect x="425" y="32" width="190" height="28" rx="6" fill="#1e293b" stroke="#475569"/>
    <text x="520" y="50" fill="#e2e8f0" font-size="11" text-anchor="middle">Action Contract Engine</text>
    <rect x="630" y="32" width="195" height="28" rx="6" fill="#1e293b" stroke="#475569"/>
    <text x="727" y="50" fill="#e2e8f0" font-size="11" text-anchor="middle">Personal Mode Enforcer</text>
  </g>

  <!-- Connectors -->
  <line x1="450" y1="255" x2="450" y2="280" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4"/>

  <!-- Layer 3: Cognitive Orchestration -->
  <g transform="translate(30, 280)">
    <rect width="840" height="70" rx="8" fill="#101726" stroke="#8b5cf6" stroke-width="1.5"/>
    <text x="15" y="22" fill="#a78bfa" font-size="10" font-family="monospace" font-weight="bold">LAYER 3: COGNITIVE ORCHESTRATION &amp; DECISION LEDGER</text>
    <rect x="15" y="32" width="190" height="28" rx="6" fill="#2e1065" stroke="#7c3aed"/>
    <text x="110" y="50" fill="#ddd6fe" font-size="11" font-weight="bold" text-anchor="middle">Multi-Agent Planner</text>
    <rect x="220" y="32" width="190" height="28" rx="6" fill="#2e1065" stroke="#7c3aed"/>
    <text x="315" y="50" fill="#ddd6fe" font-size="11" font-weight="bold" text-anchor="middle">Model Router (Sonnet/GPT4)</text>
    <rect x="425" y="32" width="190" height="28" rx="6" fill="#2e1065" stroke="#7c3aed"/>
    <text x="520" y="50" fill="#ddd6fe" font-size="11" font-weight="bold" text-anchor="middle">Explainable Decision Ledger</text>
    <rect x="630" y="32" width="195" height="28" rx="6" fill="#2e1065" stroke="#7c3aed"/>
    <text x="727" y="50" fill="#ddd6fe" font-size="11" font-weight="bold" text-anchor="middle">Output Scrubber &amp; Verifier</text>
  </g>

  <!-- Connectors Split -->
  <line x1="240" y1="350" x2="240" y2="380" stroke="#10b981" stroke-width="2"/>
  <line x1="660" y1="350" x2="660" y2="380" stroke="#10b981" stroke-width="2"/>

  <!-- Layer 4: Multimodal Studio & Sovereign Vault -->
  <g transform="translate(30, 380)">
    <rect width="405" height="110" rx="8" fill="#101726" stroke="#059669" stroke-width="1.5"/>
    <text x="15" y="24" fill="#34d399" font-size="10" font-family="monospace" font-weight="bold">MULTIMODAL CREATION STUDIO</text>
    <text x="20" y="50" fill="#e2e8f0" font-size="11">• DOCX Executive Briefs &amp; Reports</text>
    <text x="20" y="70" fill="#e2e8f0" font-size="11">• PPTX Presentation Decks &amp; Slides</text>
    <text x="20" y="90" fill="#e2e8f0" font-size="11">• XLSX Multi-Sheet Data Workbooks</text>
    <text x="215" y="50" fill="#e2e8f0" font-size="11">• PDF Printable Reports (Grade A)</text>
    <text x="215" y="70" fill="#e2e8f0" font-size="11">• Neural Image Studio (Presets)</text>
    <text x="215" y="90" fill="#e2e8f0" font-size="11">• Interactive Mermaid/SVG Diagrams</text>

    <rect x="435" width="405" height="110" rx="8" fill="#101726" stroke="#059669" stroke-width="1.5"/>
    <text x="450" y="24" fill="#34d399" font-size="10" font-family="monospace" font-weight="bold">SOVEREIGN STORAGE &amp; LINEAGE</text>
    <text x="455" y="50" fill="#e2e8f0" font-size="11">• 8-Tier Sovereign Memory Vectors</text>
    <text x="455" y="70" fill="#e2e8f0" font-size="11">• Connected Artifact Lineage Graph</text>
    <text x="455" y="90" fill="#e2e8f0" font-size="11">• Tamper-Evident SHA-256 Audit Log</text>
    <text x="650" y="50" fill="#e2e8f0" font-size="11">• Scoped Anti-IDOR Isolation</text>
    <text x="650" y="70" fill="#e2e8f0" font-size="11">• Cryptographic Session Attestation</text>
    <text x="650" y="90" fill="#e2e8f0" font-size="11">• Zero External Telemetry Leakage</text>
  </g>
</svg>`;
}

function generateFlowchartSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
    </marker>
    <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
    </marker>
  </defs>

  <text x="30" y="36" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold" letter-spacing="2">ZERO-TRUST EXECUTION FLOWCHART</text>

  <!-- Step 1: Input -->
  <rect x="40" y="70" width="180" height="50" rx="25" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="130" y="100" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">1. User Task Request</text>

  <line x1="220" y1="95" x2="270" y2="95" stroke="#06b6d4" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Step 2: Mode & Constitution -->
  <rect x="280" y="65" width="220" height="60" rx="8" fill="#0f172a" stroke="#0891b2" stroke-width="2"/>
  <text x="390" y="90" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">2. Constitution Firewall</text>
  <text x="390" y="110" fill="#94a3b8" font-size="10" text-anchor="middle">Evaluates 7 Sovereign Directives</text>

  <!-- Branch: Blocked -->
  <line x1="390" y1="125" x2="390" y2="185" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowRed)"/>
  <rect x="300" y="185" width="180" height="50" rx="8" fill="#450a0a" stroke="#dc2626" stroke-width="2"/>
  <text x="390" y="210" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">RULE VIOLATION</text>
  <text x="390" y="226" fill="#f87171" font-size="10" text-anchor="middle">Task Halted &amp; Logged</text>

  <!-- Branch: Passed -->
  <line x1="500" y1="95" x2="550" y2="95" stroke="#06b6d4" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Step 3: Action Contract & Risk -->
  <rect x="560" y="65" width="220" height="60" rx="8" fill="#101726" stroke="#8b5cf6" stroke-width="2"/>
  <text x="670" y="90" fill="#a78bfa" font-size="11" font-weight="bold" text-anchor="middle">3. Action Contract</text>
  <text x="670" y="110" fill="#cbd5e1" font-size="10" text-anchor="middle">Defines Scope &amp; Risk Rating</text>

  <line x1="670" y1="125" x2="670" y2="180" stroke="#06b6d4" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Step 4: Approval Firewall -->
  <rect x="560" y="180" width="220" height="70" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
  <text x="670" y="208" fill="#c7d2fe" font-size="11" font-weight="bold" text-anchor="middle">4. Risk Assessment</text>
  <text x="670" y="228" fill="#a5b4fc" font-size="10" text-anchor="middle">HIGH / CRITICAL Risk?</text>

  <!-- Branch: User Approval Needed -->
  <line x1="780" y1="215" x2="820" y2="215" stroke="#ef4444" stroke-width="2"/>
  <line x1="820" y1="215" x2="820" y2="310" stroke="#ef4444" stroke-width="2"/>
  <line x1="820" y1="310" x2="780" y2="310" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowRed)"/>

  <rect x="580" y="285" width="190" height="50" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
  <text x="675" y="308" fill="#fecaca" font-size="11" font-weight="bold" text-anchor="middle">Human Approval Barrier</text>
  <text x="675" y="324" fill="#fca5a5" font-size="10" text-anchor="middle">Execution Paused for User</text>

  <!-- Step 5: Execution Sandbox -->
  <line x1="580" y1="310" x2="480" y2="310" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="560" y1="215" x2="430" y2="215" stroke="#10b981" stroke-width="2"/>
  <line x1="430" y1="215" x2="430" y2="285" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="330" y="285" width="190" height="55" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="425" y="310" fill="#a7f3d0" font-size="11" font-weight="bold" text-anchor="middle">5. Sandbox Execution</text>
  <text x="425" y="328" fill="#6ee7b7" font-size="10" text-anchor="middle">Docs / PPTX / Code / Tools</text>

  <!-- Step 6: Decision Ledger & Deliver -->
  <line x1="330" y1="312" x2="250" y2="312" stroke="#06b6d4" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="50" y="280" width="200" height="65" rx="8" fill="#0f172a" stroke="#06b6d4" stroke-width="2"/>
  <text x="150" y="305" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">6. Decision Ledger</text>
  <text x="150" y="323" fill="#cbd5e1" font-size="10" text-anchor="middle">Commit SHA-256 Trace</text>
  <text x="150" y="337" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">VERIFIED RESULT DELIVERED</text>
</svg>`;
}

function generateSequenceSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 460" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="30" y="36" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold" letter-spacing="2">MULTI-MODEL ORCHESTRATION SEQUENCE</text>

  <!-- Lifelines -->
  <g stroke="#334155" stroke-dasharray="4" stroke-width="1.5">
    <line x1="90" y1="80" x2="90" y2="420" />
    <line x1="250" y1="80" x2="250" y2="420" />
    <line x1="410" y1="80" x2="410" y2="420" />
    <line x1="580" y1="80" x2="580" y2="420" />
    <line x1="750" y1="80" x2="750" y2="420" />
  </g>

  <!-- Actor Boxes -->
  <rect x="40" y="55" width="100" height="30" rx="6" fill="#1e293b" stroke="#475569"/>
  <text x="90" y="75" fill="#fff" font-size="11" text-anchor="middle">User</text>

  <rect x="195" y="55" width="110" height="30" rx="6" fill="#0f172a" stroke="#0891b2"/>
  <text x="250" y="75" fill="#38bdf8" font-size="11" text-anchor="middle">Orchestrator</text>

  <rect x="355" y="55" width="110" height="30" rx="6" fill="#1e1b4b" stroke="#7c3aed"/>
  <text x="410" y="75" fill="#c4b5fd" font-size="11" text-anchor="middle">Constitution</text>

  <rect x="525" y="55" width="110" height="30" rx="6" fill="#7f1d1d" stroke="#ef4444"/>
  <text x="580" y="75" fill="#fca5a5" font-size="11" text-anchor="middle">Firewall</text>

  <rect x="695" y="55" width="110" height="30" rx="6" fill="#064e3b" stroke="#10b981"/>
  <text x="750" y="75" fill="#a7f3d0" font-size="11" text-anchor="middle">Decision Ledger</text>

  <!-- Sequence Arrows -->
  <g font-size="10" fill="#94a3b8">
    <line x1="90" y1="120" x2="250" y2="120" stroke="#06b6d4" stroke-width="2"/>
    <text x="170" y="113" text-anchor="middle">1. Submit Goal</text>

    <line x1="250" y1="160" x2="410" y2="160" stroke="#7c3aed" stroke-width="2"/>
    <text x="330" y="153" text-anchor="middle">2. Check Policies</text>

    <line x1="410" y1="190" x2="250" y2="190" stroke="#7c3aed" stroke-width="2" stroke-dasharray="3"/>
    <text x="330" y="183" text-anchor="middle">3. Compliant</text>

    <line x1="250" y1="230" x2="580" y2="230" stroke="#ef4444" stroke-width="2"/>
    <text x="415" y="223" text-anchor="middle">4. Risk Assessment</text>

    <line x1="580" y1="270" x2="90" y2="270" stroke="#ef4444" stroke-width="2" stroke-dasharray="3"/>
    <text x="335" y="263" fill="#fca5a5" text-anchor="middle">5. Prompt User Approval</text>

    <line x1="90" y1="310" x2="580" y2="310" stroke="#10b981" stroke-width="2"/>
    <text x="335" y="303" fill="#a7f3d0" text-anchor="middle">6. User Confirms</text>

    <line x1="250" y1="350" x2="750" y2="350" stroke="#10b981" stroke-width="2"/>
    <text x="500" y="343" text-anchor="middle">7. Commit Decision Ledger</text>

    <line x1="250" y1="390" x2="90" y2="390" stroke="#06b6d4" stroke-width="2" stroke-dasharray="3"/>
    <text x="170" y="383" fill="#38bdf8" text-anchor="middle">8. Return Verified Result</text>
  </g>
</svg>`;
}

function generateErdSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',system-ui,sans-serif;">
  <text x="30" y="36" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold" letter-spacing="2">SOVEREIGN DATA &amp; LINEAGE ERD</text>

  <!-- USER Table -->
  <g transform="translate(40, 70)">
    <rect width="220" height="150" rx="8" fill="#101726" stroke="#0891b2" stroke-width="2"/>
    <rect width="220" height="30" rx="8" fill="#0891b2"/>
    <text x="110" y="20" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">User (Sovereign Root)</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11">PK id: String</text>
    <text x="15" y="75" fill="#94a3b8" font-size="11">email: String</text>
    <text x="15" y="95" fill="#94a3b8" font-size="11">role: Role</text>
    <text x="15" y="115" fill="#94a3b8" font-size="11">autonomyLevel: String</text>
    <text x="15" y="135" fill="#94a3b8" font-size="11">pauseMemory: Boolean</text>
  </g>

  <!-- TASK Table -->
  <g transform="translate(340, 70)">
    <rect width="220" height="150" rx="8" fill="#101726" stroke="#8b5cf6" stroke-width="2"/>
    <rect width="220" height="30" rx="8" fill="#7c3aed"/>
    <text x="110" y="20" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Task</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11">PK id: String</text>
    <text x="15" y="75" fill="#94a3b8" font-size="11">FK userId: String</text>
    <text x="15" y="95" fill="#94a3b8" font-size="11">title: String</text>
    <text x="15" y="115" fill="#94a3b8" font-size="11">status: TaskStatus</text>
    <text x="15" y="135" fill="#94a3b8" font-size="11">riskLevel: LOW..CRITICAL</text>
  </g>

  <!-- ARTIFACT Table -->
  <g transform="translate(640, 70)">
    <rect width="220" height="150" rx="8" fill="#101726" stroke="#10b981" stroke-width="2"/>
    <rect width="220" height="30" rx="8" fill="#059669"/>
    <text x="110" y="20" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Artifact (Lineage Graph)</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11">PK id: String</text>
    <text x="15" y="75" fill="#94a3b8" font-size="11">type: DOCX, PPTX, XLSX...</text>
    <text x="15" y="95" fill="#94a3b8" font-size="11">FK parentArtifactId: String</text>
    <text x="15" y="115" fill="#94a3b8" font-size="11">integrityHash: SHA-256</text>
    <text x="15" y="135" fill="#94a3b8" font-size="11">verifiedStatus: VERIFIED</text>
  </g>

  <!-- ACTION_CONTRACT Table -->
  <g transform="translate(190, 280)">
    <rect width="220" height="140" rx="8" fill="#101726" stroke="#f59e0b" stroke-width="2"/>
    <rect width="220" height="30" rx="8" fill="#d97706"/>
    <text x="110" y="20" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">ActionContract</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11">PK id: String</text>
    <text x="15" y="75" fill="#94a3b8" font-size="11">FK taskId: String (1:1)</text>
    <text x="15" y="95" fill="#94a3b8" font-size="11">allowedActions: JSON</text>
    <text x="15" y="115" fill="#94a3b8" font-size="11">forbiddenActions: JSON</text>
  </g>

  <!-- DECISION_LEDGER Table -->
  <g transform="translate(490, 280)">
    <rect width="220" height="140" rx="8" fill="#101726" stroke="#06b6d4" stroke-width="2"/>
    <rect width="220" height="30" rx="8" fill="#0891b2"/>
    <text x="110" y="20" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">DecisionLedger</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11">PK id: String</text>
    <text x="15" y="75" fill="#94a3b8" font-size="11">FK taskId: String (1:1)</text>
    <text x="15" y="95" fill="#94a3b8" font-size="11">memoriesConsulted: JSON</text>
    <text x="15" y="115" fill="#94a3b8" font-size="11">rulesEnforced: JSON</text>
  </g>

  <!-- Connectors -->
  <line x1="260" y1="145" x2="340" y2="145" stroke="#94a3b8" stroke-width="2"/>
  <line x1="560" y1="145" x2="640" y2="145" stroke="#94a3b8" stroke-width="2"/>
  <line x1="410" y1="220" x2="300" y2="280" stroke="#94a3b8" stroke-width="2"/>
  <line x1="490" y1="220" x2="580" y2="280" stroke="#94a3b8" stroke-width="2"/>
</svg>`;
}

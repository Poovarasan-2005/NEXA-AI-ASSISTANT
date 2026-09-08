import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export interface SearchResultItem {
  id: string;
  category: "PAGES" | "ACTIONS" | "PROJECTS" | "ARTIFACTS" | "RESEARCH" | "DATA" | "WORKFLOWS" | "MEMORIES";
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
}

const STATIC_SYSTEM_ACTIONS: SearchResultItem[] = [
  { id: "action-chat", category: "ACTIONS", title: "New AI Chat & Reasoning Session", subtitle: "Open sovereign multimodal chat interface", url: "/app/chat" },
  { id: "action-docx", category: "ACTIONS", title: "Generate Executive Word Brief (.docx)", subtitle: "Create formatted report with tables and callout boxes", url: "/app/chat?prompt=Generate+an+executive+word+brief" },
  { id: "action-pptx", category: "ACTIONS", title: "Generate Presentation Deck (.pptx)", subtitle: "Assemble 16:9 Dark Modern PowerPoint deck", url: "/app/chat?prompt=Generate+a+PowerPoint+presentation+deck" },
  { id: "action-xlsx", category: "ACTIONS", title: "Export Excel Workbook (.xlsx)", subtitle: "Compile 3-sheet metrics and constitution workbook", url: "/app/chat?prompt=Export+a+multi-sheet+Excel+workbook" },
  { id: "action-research", category: "ACTIONS", title: "Run Deep Research Dossier", subtitle: "Analyze topic into Evidence, Inference, Recommendation & Uncertainty", url: "/app/research" },
  { id: "action-data", category: "ACTIONS", title: "Profile Dataset & Detect Anomalies", subtitle: "Compute completeness and IQR outliers in AI Data Studio", url: "/app/data" },
  { id: "action-diagram", category: "ACTIONS", title: "Synthesize System Diagram", subtitle: "Generate Architecture, Flowchart, or Sequence SVG", url: "/app/diagrams" },
  { id: "action-project", category: "ACTIONS", title: "Create New Project Workspace", subtitle: "Organize isolated files, tasks, memories, and workflows", url: "/app/projects" },
  { id: "action-workflow", category: "ACTIONS", title: "Build Visual Automated Workflow", subtitle: "Design node-based pipeline on visual canvas", url: "/app/workflows" },
  { id: "page-trust", category: "PAGES", title: "Trust Center & Cryptographic Vault", subtitle: "Inspect model isolation, zero retention, and compliance attestations", url: "/app/trust" },
  { id: "action-trust-audit", category: "ACTIONS", title: "Run Cryptographic Integrity Audit", subtitle: "Verify SHA-256 artifact checksums and invariants", url: "/app/trust" },
  { id: "page-constitution", category: "PAGES", title: "AI Constitution & Policy Center", subtitle: "Review and toggle the 7 sovereign directives", url: "/app/constitution" },
  { id: "page-artifacts", category: "PAGES", title: "Connected Artifact Lineage Hub", subtitle: "Inspect SHA-256 DAG and provenance graph", url: "/app/artifacts" },
  { id: "page-memory", category: "PAGES", title: "Multi-Tier Memory Center", subtitle: "Inspect and purge episodic and semantic memories", url: "/app/memory" },
  { id: "page-approvals", category: "PAGES", title: "Human Approval Firewall", subtitle: "Review halted high-risk actions and grants", url: "/app/approvals" },
  { id: "page-settings", category: "PAGES", title: "System Settings & Personal Modes", subtitle: "Configure model router and autonomy levels", url: "/app/settings" },
];

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      // Return top system actions and pages
      return NextResponse.json({
        success: true,
        results: STATIC_SYSTEM_ACTIONS.slice(0, 10),
      });
    }

    const matchedStatic = STATIC_SYSTEM_ACTIONS.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q)
    );

    // Concurrently search user's sovereign records
    const [projects, artifacts, factLedgers, dataProfiles, workflows, memories] = await Promise.all([
      db.project.findMany({
        where: {
          userId: sessionData.user.id,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        take: 4,
        select: { id: true, name: true, description: true, status: true },
      }),
      db.artifact.findMany({
        where: {
          userId: sessionData.user.id,
          title: { contains: q },
        },
        take: 4,
        select: { id: true, title: true, type: true, downloadUrl: true },
      }),
      db.factLedger.findMany({
        where: {
          userId: sessionData.user.id,
          topic: { contains: q },
        },
        take: 4,
        select: { id: true, topic: true, summary: true, groundingScore: true },
      }),
      db.dataProfile.findMany({
        where: {
          userId: sessionData.user.id,
          datasetName: { contains: q },
        },
        take: 4,
        select: { id: true, datasetName: true, qualityGrade: true, completenessPct: true },
      }),
      db.workflow.findMany({
        where: {
          userId: sessionData.user.id,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        take: 4,
        select: { id: true, name: true, description: true, triggerType: true },
      }),
      db.memory.findMany({
        where: {
          userId: sessionData.user.id,
          content: { contains: q },
        },
        take: 4,
        select: { id: true, content: true, type: true },
      }),
    ]);

    const dynamicResults: SearchResultItem[] = [
      ...projects.map((p) => ({
        id: `proj-${p.id}`,
        category: "PROJECTS" as const,
        title: p.name,
        subtitle: p.description || `Status: ${p.status}`,
        url: `/app/projects?id=${p.id}`,
      })),
      ...artifacts.map((a) => ({
        id: `art-${a.id}`,
        category: "ARTIFACTS" as const,
        title: a.title,
        subtitle: `Type: ${a.type}`,
        url: a.downloadUrl,
      })),
      ...factLedgers.map((f) => ({
        id: `fact-${f.id}`,
        category: "RESEARCH" as const,
        title: f.topic,
        subtitle: `Grounding Score: ${f.groundingScore}%`,
        url: `/app/research`,
      })),
      ...dataProfiles.map((d) => ({
        id: `data-${d.id}`,
        category: "DATA" as const,
        title: d.datasetName,
        subtitle: `Grade: ${d.qualityGrade} | Completeness: ${d.completenessPct}%`,
        url: `/app/data`,
      })),
      ...workflows.map((w) => ({
        id: `wf-${w.id}`,
        category: "WORKFLOWS" as const,
        title: w.name,
        subtitle: `Trigger: ${w.triggerType}`,
        url: `/app/workflows?id=${w.id}`,
      })),
      ...memories.map((m) => ({
        id: `mem-${m.id}`,
        category: "MEMORIES" as const,
        title: m.content.length > 60 ? `${m.content.slice(0, 60)}...` : m.content,
        subtitle: `Type: ${m.type}`,
        url: `/app/memory`,
      })),
    ];

    const results = [...matchedStatic, ...dynamicResults].slice(0, 15);

    return NextResponse.json({
      success: true,
      query: q,
      results,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return new NextResponse("Failed to execute search", { status: 500 });
  }
}

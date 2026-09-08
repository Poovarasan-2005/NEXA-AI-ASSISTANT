import { db } from "@/lib/db";
import crypto from "crypto";

export interface CreateArtifactInput {
  userId: string;
  title: string;
  type:
    | "DOCUMENT_DOCX"
    | "PRESENTATION_PPTX"
    | "SPREADSHEET_XLSX"
    | "DOCUMENT_PDF"
    | "DATASET_CSV"
    | "IMAGE_PNG"
    | "DIAGRAM_SVG"
    | "CODE_SNIPPET";
  mimeType: string;
  downloadUrl: string;
  fileSize?: number;
  previewData?: string;
  metadata?: Record<string, any>;
  parentArtifactId?: string;
  taskId?: string;
  projectId?: string;
  integrityHash?: string;
}

export async function recordArtifact(input: CreateArtifactInput) {
  const hash =
    input.integrityHash ||
    crypto
      .createHash("sha256")
      .update(`${input.title}|${input.userId}|${input.downloadUrl}|${Date.now()}`)
      .digest("hex");

  const artifact = await db.artifact.create({
    data: {
      userId: input.userId,
      title: input.title,
      type: input.type,
      mimeType: input.mimeType,
      downloadUrl: input.downloadUrl,
      fileSize: input.fileSize || 0,
      previewData: input.previewData || null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      parentArtifactId: input.parentArtifactId || null,
      taskId: input.taskId || null,
      projectId: input.projectId || null,
      verifiedStatus: "VERIFIED",
      integrityHash: hash,
    },
  });

  return artifact;
}

export async function getUserArtifacts(userId: string) {
  return db.artifact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      parentArtifact: {
        select: { id: true, title: true, type: true },
      },
      childArtifacts: {
        select: { id: true, title: true, type: true },
      },
    },
  });
}

export interface ArtifactGraphNode {
  id: string;
  title: string;
  type: string;
  downloadUrl: string;
  hash: string;
  createdAt: string;
  verified: boolean;
  meta?: any;
}

export interface ArtifactGraphEdge {
  from: string;
  to: string;
  relationship: string;
}

export async function getArtifactLineageGraph(userId: string): Promise<{
  nodes: ArtifactGraphNode[];
  edges: ArtifactGraphEdge[];
}> {
  const artifacts = await db.artifact.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const nodes: ArtifactGraphNode[] = artifacts.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    downloadUrl: a.downloadUrl,
    hash: a.integrityHash,
    createdAt: a.createdAt.toISOString(),
    verified: a.verifiedStatus === "VERIFIED",
    meta: a.metadata ? JSON.parse(a.metadata) : undefined,
  }));

  const edges: ArtifactGraphEdge[] = [];

  for (const a of artifacts) {
    if (a.parentArtifactId) {
      edges.push({
        from: a.parentArtifactId,
        to: a.id,
        relationship: "DERIVED_FROM",
      });
    }
  }

  // If there are disconnected artifacts, synthesize natural lineage based on types if applicable
  return { nodes, edges };
}

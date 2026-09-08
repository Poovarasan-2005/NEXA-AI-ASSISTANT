import { db } from "@/lib/db";
import { recordActivityEvent } from "@/lib/audit";

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "COMPLETED";
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED" | "COMPLETED";
}

export async function getUserProjects(userId: string) {
  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          tasks: true,
          memories: true,
          files: true,
          artifacts: true,
          workflows: true,
        },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    counts: {
      tasks: p._count.tasks,
      memories: p._count.memories,
      files: p._count.files,
      artifacts: p._count.artifacts,
      workflows: p._count.workflows,
    },
  }));
}

export async function getProjectDetails(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          riskLevel: true,
          createdAt: true,
        },
      },
      memories: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          content: true,
          type: true,
          confidence: true,
          source: true,
          createdAt: true,
        },
      },
      files: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          filename: true,
          fileType: true,
          fileSize: true,
          scanStatus: true,
          createdAt: true,
        },
      },
      artifacts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          downloadUrl: true,
          verifiedStatus: true,
          integrityHash: true,
          createdAt: true,
        },
      },
      workflows: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          triggerType: true,
          runsCount: true,
          lastRunStatus: true,
          lastRunAt: true,
        },
      },
    },
  });

  if (!project) return null;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    tasks: project.tasks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    memories: project.memories.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    files: project.files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
    artifacts: project.artifacts.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    workflows: project.workflows.map((w) => ({
      ...w,
      lastRunAt: w.lastRunAt?.toISOString() || null,
    })),
  };
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const project = await db.project.create({
    data: {
      user: { connect: { id: userId } },
      name: input.name,
      description: input.description || null,
      status: input.status || "ACTIVE",
    },
  });

  await recordActivityEvent({
    userId,
    type: "TASK_CREATED",
    title: `Project Created: ${project.name}`,
    description: `Initiated new sovereign project workspace: "${project.name}"`,
    metadata: { projectId: project.id },
  });

  return project;
}

export async function updateProject(projectId: string, userId: string, input: UpdateProjectInput) {
  const existing = await db.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!existing) return null;

  return db.project.update({
    where: { id: projectId },
    data: {
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status ?? existing.status,
    },
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const existing = await db.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!existing) return false;

  await db.project.delete({
    where: { id: projectId },
  });

  return true;
}

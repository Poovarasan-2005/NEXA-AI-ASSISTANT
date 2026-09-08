import { db } from "../db";

export interface AddMemoryParams {
  userId: string;
  projectId?: string;
  type: string;
  content: string;
  source: string;
  confidence?: number;
}

export async function addMemory(params: AddMemoryParams) {
  // Check if user has paused memory
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { pauseMemory: true },
  });

  if (user?.pauseMemory) {
    return { skipped: true, reason: "Memory is currently paused by user." };
  }

  const memory = await db.memory.create({
    data: {
      userId: params.userId,
      projectId: params.projectId || null,
      type: params.type,
      content: params.content,
      source: params.source,
      confidence: params.confidence || 0.95,
      lastConfirmedAt: new Date(),
    },
  });

  return { skipped: false, memory };
}

export async function getRelevantMemories(userId: string, query: string, limit = 5) {
  const memories = await db.memory.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Relevance ranking based on keyword overlap and confidence
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = memories.map((m) => {
    let score = m.confidence;
    const contentLower = m.content.toLowerCase();

    for (const kw of keywords) {
      if (contentLower.includes(kw)) {
        score += 0.5;
      }
    }

    return { memory: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.memory);
}

export async function clearAllUserMemory(userId: string) {
  return await db.memory.deleteMany({
    where: { userId },
  });
}

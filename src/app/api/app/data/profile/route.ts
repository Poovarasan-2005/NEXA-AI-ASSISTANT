import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { profileDataset, saveDatasetProfile } from "@/lib/data/dataProfiler";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const datasetType = searchParams.get("type") || "telemetry";

    // Generate sample dataset for live profiling demo
    const headers = ["event_id", "subsystem", "metric_name", "efficiency_score", "latency_ms", "status"];
    const rows: (string | number)[][] = [];

    const subsystems = ["Sandbox", "Memory", "Governance", "Compliance", "Inference", "Knowledge"];
    const metrics = ["Isolation Barrier", "Recall Latency", "Firewall Check", "Audit Vault", "Model Router", "RAG Ingest"];

    for (let i = 1; i <= 50; i++) {
      const sub = subsystems[(i - 1) % subsystems.length];
      const met = metrics[(i - 1) % metrics.length];
      const eff = Number((96.5 + (i % 35) * 0.1).toFixed(1));
      const lat = 10 + (i % 20);
      rows.push([i, sub, met, eff, lat, "OPTIMAL"]);
    }

    const report = profileDataset(`nexa_${datasetType}_dataset.csv`, headers, rows);
    await saveDatasetProfile(sessionData.user.id, report);

    // Also get previous profiles
    const history = await db.dataProfile.findMany({
      where: { userId: sessionData.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      report,
      profile: report,
      history,
      profiles: history,
    });
  } catch (error: any) {
    console.error("Data profile GET error:", error);
    return new NextResponse("Failed to profile dataset", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    let { datasetName = "uploaded_dataset.csv", headers = [], rows = [] } = body;

    // Support rows passed as array of objects
    if (Array.isArray(rows) && rows.length > 0 && !Array.isArray(rows[0]) && typeof rows[0] === "object" && rows[0] !== null) {
      if (!Array.isArray(headers) || headers.length === 0) {
        headers = Object.keys(rows[0]);
      }
      rows = rows.map((obj: Record<string, any>) => headers.map((h: string) => obj[h]));
    }

    const report = profileDataset(datasetName, headers, rows);
    const saved = await saveDatasetProfile(sessionData.user.id, report);

    return NextResponse.json({
      success: true,
      profile: { ...report, id: saved.id },
      report: { ...report, id: saved.id },
    });
  } catch (error: any) {
    console.error("Data profile POST error:", error);
    return new NextResponse("Failed to process dataset profiling", { status: 500 });
  }
}

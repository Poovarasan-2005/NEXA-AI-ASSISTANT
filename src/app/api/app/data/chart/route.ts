import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateChart, getPresetChart, ChartType } from "@/lib/charts/chartEngine";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "BAR").toUpperCase() as ChartType;

    const chart = getPresetChart(type);
    return NextResponse.json({ success: true, chart, svg: chart.svgMarkup });
  } catch (error: any) {
    console.error("Chart GET error:", error);
    return new NextResponse("Failed to generate chart", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title = "NEXA Analytical Chart", type = "BAR", data = [], xAxisLabel, yAxisLabel } = body;

    const chart = generateChart({
      title,
      type: type.toUpperCase() as ChartType,
      xAxisLabel,
      yAxisLabel,
      data,
    });

    return NextResponse.json({ success: true, chart, svg: chart.svgMarkup });
  } catch (error: any) {
    console.error("Chart POST error:", error);
    return new NextResponse("Failed to compile chart", { status: 500 });
  }
}

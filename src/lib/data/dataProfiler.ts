import { db } from "@/lib/db";

export interface ColumnProfile {
  name: string;
  inferredType: "INTEGER" | "FLOAT" | "CATEGORICAL" | "DATETIME" | "IDENTIFIER" | "TEXT";
  totalCount: number;
  nullCount: number;
  completenessPct: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  cardinality: "HIGH" | "MEDIUM" | "LOW";
  outliersDetected: number;
}

export interface DataQualityReport {
  id?: string;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  overallScore: number; // 0 - 100
  qualityGrade: "A+" | "A" | "B" | "C" | "F";
  completenessPct: number;
  duplicateRowsCount: number;
  anomalyCount: number;
  columns: ColumnProfile[];
  recommendations: string[];
  generatedAt: string;
}

export function profileDataset(
  datasetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): DataQualityReport {
  const rowCount = rows.length;
  const colCount = headers.length;

  if (rowCount === 0) {
    return {
      datasetName,
      rowCount: 0,
      columnCount: colCount,
      overallScore: 0,
      qualityGrade: "F",
      completenessPct: 0,
      duplicateRowsCount: 0,
      anomalyCount: 0,
      columns: [],
      recommendations: ["Dataset is empty. Ingest at least 1 record to calculate profiling metrics."],
      generatedAt: new Date().toISOString(),
    };
  }

  // 1. Duplicate detection
  const rowStrings = new Set<string>();
  let duplicateRowsCount = 0;
  for (const row of rows) {
    const serialized = JSON.stringify(row);
    if (rowStrings.has(serialized)) {
      duplicateRowsCount++;
    } else {
      rowStrings.add(serialized);
    }
  }

  let totalNulls = 0;
  let totalAnomalies = 0;
  const columns: ColumnProfile[] = [];

  for (let c = 0; c < colCount; c++) {
    const colName = headers[c] || `col_${c}`;
    const values = rows.map((r) => r[c]);
    const validValues = values.filter((v) => v !== null && v !== undefined && v !== "");
    const nullCount = values.length - validValues.length;
    totalNulls += nullCount;
    const completenessPct = Number((((values.length - nullCount) / values.length) * 100).toFixed(1));

    const uniqueSet = new Set(validValues.map((v) => String(v)));
    const uniqueCount = uniqueSet.size;

    // Type inference
    let isNumeric = true;
    let isFloat = false;
    let isDate = true;

    for (const v of validValues.slice(0, 50)) {
      const s = String(v).trim();
      if (isNaN(Number(s))) isNumeric = false;
      if (s.includes(".")) isFloat = true;
      if (isNaN(Date.parse(s)) || s.length < 8) isDate = false;
    }

    let inferredType: ColumnProfile["inferredType"] = "TEXT";
    if (isNumeric) {
      inferredType = isFloat ? "FLOAT" : "INTEGER";
    } else if (isDate && validValues.length > 0) {
      inferredType = "DATETIME";
    } else if (colName.toLowerCase().includes("id") || colName.toLowerCase().includes("uuid")) {
      inferredType = "IDENTIFIER";
    } else if (uniqueCount < Math.max(values.length * 0.2, 10)) {
      inferredType = "CATEGORICAL";
    }

    // Numerical stats & outlier detection (IQR rule)
    let minVal: any = undefined;
    let maxVal: any = undefined;
    let meanVal: number | undefined = undefined;
    let medianVal: number | undefined = undefined;
    let outliersDetected = 0;

    if (inferredType === "INTEGER" || inferredType === "FLOAT") {
      const numVals = validValues.map((v) => Number(v)).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      if (numVals.length > 0) {
        minVal = numVals[0];
        maxVal = numVals[numVals.length - 1];
        const sum = numVals.reduce((a, b) => a + b, 0);
        meanVal = Number((sum / numVals.length).toFixed(2));
        const mid = Math.floor(numVals.length / 2);
        medianVal = numVals.length % 2 !== 0 ? numVals[mid] : Number(((numVals[mid - 1] + numVals[mid]) / 2).toFixed(2));

        // IQR Outliers
        const q1 = numVals[Math.floor(numVals.length * 0.25)];
        const q3 = numVals[Math.floor(numVals.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        outliersDetected = numVals.filter((n) => n < lowerBound || n > upperBound).length;
        totalAnomalies += outliersDetected;
      }
    } else if (validValues.length > 0) {
      minVal = String(validValues[0]).substring(0, 20);
      maxVal = String(validValues[validValues.length - 1]).substring(0, 20);
    }

    const cardinality: ColumnProfile["cardinality"] =
      uniqueCount / values.length > 0.6 ? "HIGH" : uniqueCount / values.length > 0.1 ? "MEDIUM" : "LOW";

    columns.push({
      name: colName,
      inferredType,
      totalCount: values.length,
      nullCount,
      completenessPct,
      uniqueCount,
      min: minVal,
      max: maxVal,
      mean: meanVal,
      median: medianVal,
      cardinality,
      outliersDetected,
    });
  }

  // Calculate Overall Quality Score
  const totalCells = rowCount * colCount;
  const overallCompleteness = Number((((totalCells - totalNulls) / totalCells) * 100).toFixed(1));
  const duplicatePenalty = Math.min((duplicateRowsCount / rowCount) * 50, 30);
  const anomalyPenalty = Math.min((totalAnomalies / rowCount) * 40, 25);
  const missingPenalty = Math.max((100 - overallCompleteness) * 0.5, 0);

  const rawScore = 100 - duplicatePenalty - anomalyPenalty - missingPenalty;
  const overallScore = Math.max(Math.min(Number(rawScore.toFixed(1)), 100), 0);

  let qualityGrade: DataQualityReport["qualityGrade"] = "A+";
  if (overallScore >= 95) qualityGrade = "A+";
  else if (overallScore >= 85) qualityGrade = "A";
  else if (overallScore >= 75) qualityGrade = "B";
  else if (overallScore >= 60) qualityGrade = "C";
  else qualityGrade = "F";

  const recommendations: string[] = [];
  if (duplicateRowsCount > 0) {
    recommendations.push(`Deduplicate ${duplicateRowsCount} duplicate record(s) to prevent statistical skew.`);
  }
  if (totalNulls > 0) {
    recommendations.push(`Impute or address ${totalNulls} missing value(s) across columns.`);
  }
  if (totalAnomalies > 0) {
    recommendations.push(`Inspect ${totalAnomalies} statistical outlier(s) flagged via IQR bounds.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Data quality is Grade A+ optimal. Zero missing values or anomalies detected.");
  }

  return {
    datasetName,
    rowCount,
    columnCount: colCount,
    overallScore,
    qualityGrade,
    completenessPct: overallCompleteness,
    duplicateRowsCount,
    anomalyCount: totalAnomalies,
    columns,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export async function saveDatasetProfile(userId: string, report: DataQualityReport, taskId?: string) {
  return db.dataProfile.create({
    data: {
      user: { connect: { id: userId } },
      ...(taskId ? { task: { connect: { id: taskId } } } : {}),
      datasetName: report.datasetName,
      rowCount: report.rowCount,
      columnCount: report.columnCount,
      qualityScore: isNaN(report.overallScore) ? 100.0 : report.overallScore,
      qualityGrade: report.qualityGrade,
      completenessPct: isNaN(report.completenessPct) ? 100.0 : report.completenessPct,
      duplicateCount: report.duplicateRowsCount,
      anomalyCount: report.anomalyCount,
      schemaProfile: JSON.stringify(report.columns),
      recommendations: JSON.stringify(report.recommendations),
    },
  });
}

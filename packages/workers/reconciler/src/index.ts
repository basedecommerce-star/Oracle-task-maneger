import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import * as stringSimilarity from "string-similarity";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const SIMILARITY_THRESHOLD = 0.9;

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

interface ReconcilerJobData {
  parserRunIdA: string;
  parserRunIdB: string;
}

interface ParserOutputRecord {
  id: string;
  externalSourceId: string | null;
  questionText: string;
  answersJson: unknown;
  imageUrl: string | null;
  explanationText: string | null;
}

interface MatchedPair {
  outputA: ParserOutputRecord;
  outputB: ParserOutputRecord;
}

function matchOutputs(
  outputsA: ParserOutputRecord[],
  outputsB: ParserOutputRecord[]
): MatchedPair[] {
  const matched: MatchedPair[] = [];
  const usedB = new Set<string>();

  // First pass: match by externalSourceId
  for (const a of outputsA) {
    if (!a.externalSourceId) continue;

    const match = outputsB.find(
      (b) => !usedB.has(b.id) && b.externalSourceId === a.externalSourceId
    );

    if (match) {
      matched.push({ outputA: a, outputB: match });
      usedB.add(match.id);
    }
  }

  // Second pass: match unmatched items by text similarity
  const unmatchedA = outputsA.filter(
    (a) => !matched.some((m) => m.outputA.id === a.id)
  );
  const unmatchedB = outputsB.filter((b) => !usedB.has(b.id));

  if (unmatchedA.length > 0 && unmatchedB.length > 0) {
    const bTexts = unmatchedB.map((b) => b.questionText);

    for (const a of unmatchedA) {
      if (bTexts.length === 0) break;

      const result = stringSimilarity.compareBestMatch(
        a.questionText,
        bTexts
      );

      if (result.bestMatch.rating >= SIMILARITY_THRESHOLD) {
        const bestIdx = result.bestMatchIndex;
        const matchedB = unmatchedB[bestIdx];
        matched.push({ outputA: a, outputB: matchedB });
        usedB.add(matchedB.id);

        // Remove matched item from remaining candidates
        bTexts.splice(bestIdx, 1);
        unmatchedB.splice(bestIdx, 1);
      }
    }
  }

  return matched;
}

type ComparisonField = "questionText" | "answersJson" | "imageUrl" | "explanationText";

async function compareAndCreateDiffs(pair: MatchedPair): Promise<number> {
  let conflicts = 0;

  const fields: ComparisonField[] = [
    "questionText",
    "answersJson",
    "imageUrl",
    "explanationText",
  ];

  for (const field of fields) {
    const valueA = field === "answersJson"
      ? JSON.stringify(pair.outputA[field])
      : (pair.outputA[field] as string | null) ?? "";

    const valueB = field === "answersJson"
      ? JSON.stringify(pair.outputB[field])
      : (pair.outputB[field] as string | null) ?? "";

    const similarity =
      valueA === "" && valueB === ""
        ? 1.0
        : stringSimilarity.compareTwoStrings(String(valueA), String(valueB));

    const isConflict = similarity < SIMILARITY_THRESHOLD;
    if (isConflict) conflicts++;

    await prisma.parserDiff.create({
      data: {
        outputAId: pair.outputA.id,
        outputBId: pair.outputB.id,
        fieldName: field,
        valueA: String(valueA),
        valueB: String(valueB),
        isConflict,
      },
    });
  }

  return conflicts;
}

const worker = new Worker<ReconcilerJobData>(
  "reconciler",
  async (job: Job<ReconcilerJobData>) => {
    const { parserRunIdA, parserRunIdB } = job.data;
    console.log(
      `[reconciler] Reconciling parser runs: ${parserRunIdA} vs ${parserRunIdB}`
    );

    const [runA, runB] = await Promise.all([
      prisma.parserRun.findUniqueOrThrow({
        where: { id: parserRunIdA },
        include: { parserOutputs: true },
      }),
      prisma.parserRun.findUniqueOrThrow({
        where: { id: parserRunIdB },
        include: { parserOutputs: true },
      }),
    ]);

    const outputsA = runA.parserOutputs as unknown as ParserOutputRecord[];
    const outputsB = runB.parserOutputs as unknown as ParserOutputRecord[];

    console.log(
      `[reconciler] Run A has ${outputsA.length} outputs, Run B has ${outputsB.length} outputs`
    );

    const matched = matchOutputs(outputsA, outputsB);
    console.log(`[reconciler] Matched ${matched.length} question pairs`);

    let totalConflicts = 0;
    for (const pair of matched) {
      const conflicts = await compareAndCreateDiffs(pair);
      totalConflicts += conflicts;
    }

    console.log(
      `[reconciler] Summary: ${matched.length} matched pairs, ${totalConflicts} field conflicts found`
    );
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`[reconciler] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[reconciler] Job ${job?.id} failed: ${err.message}`);
});

console.log("[reconciler] Worker started, waiting for jobs...");

async function shutdown(): Promise<void> {
  console.log("[reconciler] Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

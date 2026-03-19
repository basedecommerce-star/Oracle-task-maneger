import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import IORedis from "ioredis";

// TODO: Enable these imports when implementing full OCR pipeline
// import sharp from "sharp";
// import Tesseract from "tesseract.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

interface ParserVisualJobData {
  snapshotId: string;
}

interface ParsedAnswer {
  text: string;
  order: number;
  isCorrect: boolean;
}

interface ParsedQuestion {
  questionText: string;
  answersJson: ParsedAnswer[];
  imageUrl: string | null;
  explanationText: string | null;
  externalSourceId: string | null;
}

const worker = new Worker<ParserVisualJobData>(
  "parser-visual",
  async (job: Job<ParserVisualJobData>) => {
    const { snapshotId } = job.data;
    console.log(`[parser-visual] Processing snapshot ${snapshotId}`);

    const snapshot = await prisma.sourceSnapshot.findUniqueOrThrow({
      where: { id: snapshotId },
    });

    const parserRun = await prisma.parserRun.create({
      data: {
        snapshotId: snapshot.id,
        parserType: "VISUAL",
        parserVersion: "0.1.0",
        status: "RUNNING",
      },
    });

    try {
      const screenshotKey = snapshot.screenshotKey;
      if (!screenshotKey) {
        throw new Error("Snapshot has no screenshotKey for visual parsing");
      }

      // TODO: Download the screenshot from object storage using screenshotKey
      // const imageBuffer = await downloadFromStorage(screenshotKey);

      // TODO: Preprocess image with sharp for better OCR accuracy
      // const processedImage = await sharp(imageBuffer)
      //   .grayscale()
      //   .normalize()
      //   .sharpen()
      //   .toBuffer();

      // TODO: Run OCR with tesseract.js
      // const { data: { text } } = await Tesseract.recognize(processedImage, "ron+rus");

      // TODO: Parse OCR text into structured question data
      // The OCR text needs to be parsed to identify:
      // - Question numbers and text
      // - Answer options (A, B, C, D patterns)
      // - Correct answer markers
      // - Image references
      const questions: ParsedQuestion[] = [];

      console.log(
        `[parser-visual] STUB: Visual parsing not yet implemented. ` +
          `Found ${questions.length} questions in snapshot ${snapshotId}`
      );

      for (const q of questions) {
        await prisma.parserOutput.create({
          data: {
            parserRunId: parserRun.id,
            externalSourceId: q.externalSourceId,
            questionText: q.questionText,
            answersJson: JSON.parse(JSON.stringify(q.answersJson)),
            imageUrl: q.imageUrl,
            explanationText: q.explanationText,
          },
        });
      }

      await prisma.parserRun.update({
        where: { id: parserRun.id },
        data: {
          status: "COMPLETED",
          questionsFound: questions.length,
          finishedAt: new Date(),
        },
      });

      console.log(
        `[parser-visual] Completed: ${questions.length} questions parsed from snapshot ${snapshotId}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[parser-visual] Failed for snapshot ${snapshotId}: ${errorMessage}`
      );

      await prisma.parserRun.update({
        where: { id: parserRun.id },
        data: {
          status: "FAILED",
          errorMessage,
          finishedAt: new Date(),
        },
      });

      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`[parser-visual] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[parser-visual] Job ${job?.id} failed: ${err.message}`);
});

console.log("[parser-visual] Worker started, waiting for jobs...");

async function shutdown(): Promise<void> {
  console.log("[parser-visual] Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

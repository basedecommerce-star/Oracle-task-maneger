import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

interface ParserHtmlJobData {
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

const QUESTION_SELECTORS = [
  ".question-block",
  ".test-item",
  ".quiz-question",
  ".exam-question",
  "[data-question]",
];

function parseQuestions(html: string): ParsedQuestion[] {
  const $ = cheerio.load(html);
  const questions: ParsedQuestion[] = [];

  const selector = QUESTION_SELECTORS.join(", ");
  const questionElements = $(selector);

  questionElements.each((index, element) => {
    const $el = $(element);

    const questionText =
      $el.find(".question-text, .question, h3, h4, p").first().text().trim() ||
      "";

    if (!questionText) return;

    const answers: ParsedAnswer[] = [];
    $el
      .find(
        ".answer, .option, .variant, li, [data-answer]"
      )
      .each((ansIdx, ansEl) => {
        const $ans = $(ansEl);
        const text = $ans.text().trim();
        if (!text) return;

        const isCorrect =
          $ans.hasClass("correct") ||
          $ans.hasClass("right") ||
          $ans.attr("data-correct") === "true" ||
          false;

        answers.push({ text, order: ansIdx + 1, isCorrect });
      });

    const imageUrl =
      $el.find("img").first().attr("src") || null;

    const explanationText =
      $el.find(".explanation, .hint, .comment").first().text().trim() || null;

    const externalSourceId =
      $el.attr("data-id") ||
      $el.attr("data-question-id") ||
      $el.attr("id") ||
      null;

    questions.push({
      questionText,
      answersJson: answers,
      imageUrl,
      explanationText,
      externalSourceId,
    });
  });

  return questions;
}

const worker = new Worker<ParserHtmlJobData>(
  "parser-html",
  async (job: Job<ParserHtmlJobData>) => {
    const { snapshotId } = job.data;
    console.log(`[parser-html] Processing snapshot ${snapshotId}`);

    const snapshot = await prisma.sourceSnapshot.findUniqueOrThrow({
      where: { id: snapshotId },
    });

    const parserRun = await prisma.parserRun.create({
      data: {
        snapshotId: snapshot.id,
        parserType: "HTML",
        parserVersion: "1.0.0",
        status: "RUNNING",
      },
    });

    try {
      const rawContent = snapshot.rawContent;
      if (!rawContent) {
        throw new Error("Snapshot has no rawContent");
      }

      const questions = parseQuestions(rawContent);
      console.log(
        `[parser-html] Found ${questions.length} questions in snapshot ${snapshotId}`
      );

      for (const q of questions) {
        await prisma.parserOutput.create({
          data: {
            parserRunId: parserRun.id,
            externalSourceId: q.externalSourceId,
            questionText: q.questionText,
            answersJson: JSON.stringify(q.answersJson),
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
        `[parser-html] Completed: ${questions.length} questions parsed from snapshot ${snapshotId}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[parser-html] Failed for snapshot ${snapshotId}: ${errorMessage}`
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
  console.log(`[parser-html] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[parser-html] Job ${job?.id} failed: ${err.message}`);
});

console.log("[parser-html] Worker started, waiting for jobs...");

async function shutdown(): Promise<void> {
  console.log("[parser-html] Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

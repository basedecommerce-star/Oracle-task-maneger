import { Telegraf, Markup } from "telegraf";
import * as dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || "https://example.com";
const API_URL = process.env.API_URL || "http://localhost:3001";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is not set in environment variables");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.command("start", (ctx) => {
  const firstName = ctx.from?.first_name ?? "пользователь";
  return ctx.reply(
    `Привет, ${firstName}! 👋\n\nДобро пожаловать в PDD Moldova Bot.\nОткройте мини-приложение, чтобы начать подготовку к экзамену.`,
    Markup.inlineKeyboard([
      Markup.button.webApp("Открыть приложение", WEBAPP_URL),
    ])
  );
});

bot.command("help", (ctx) => {
  return ctx.reply(
    "📋 Доступные команды:\n\n" +
      "/start – Запустить бота и открыть приложение\n" +
      "/help  – Показать список команд\n" +
      "/stats – Показать вашу статистику"
  );
});

bot.command("stats", async (ctx) => {
  const userId = ctx.from?.id;

  try {
    const response = await fetch(
      `${API_URL}/stats/overview?userId=${userId}`,
    );

    if (!response.ok) {
      return ctx.reply("📊 Статистика недоступна. Попробуйте позже.");
    }

    const data = (await response.json()) as {
      totalAnswered: number;
      totalCorrect: number;
      totalWrong: number;
      correctRate: number;
      byTopic: { topicId: string; topicName: string; answered: number; correct: number }[];
      recentSessions: { sessionId: string; sessionType: string; totalQuestions: number; correctAnswers: number; isPassed: boolean | null; createdAt: string }[];
    };

    const examSessions = data.recentSessions.filter(s => s.sessionType === 'EXAM');
    const examsPassed = examSessions.filter(s => s.isPassed === true).length;
    const examsTotal = examSessions.length;
    const examPassRate = examsTotal > 0 ? Math.round((examsPassed / examsTotal) * 100) : 0;

    const examStats = examsTotal > 0
      ? `Экзаменов сдано: ${examsPassed} из ${examsTotal} (${examPassRate}%)`
      : `Экзаменов сдано: 0`;

    return ctx.reply(
      `📊 Статистика (ID: ${userId}):\n\n` +
        `Отвечено вопросов: ${data.totalAnswered}\n` +
        `Правильных ответов: ${data.totalCorrect} (${data.correctRate}%)\n` +
        `Ошибок: ${data.totalWrong}\n\n` +
        `${examStats}\n\n` +
        `Подробная статистика доступна в мини-приложении.`,
    );
  } catch {
    return ctx.reply("📊 Статистика недоступна. Попробуйте позже.");
  }
});

bot.launch().then(() => {
  console.log("🤖 Bot is running…");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

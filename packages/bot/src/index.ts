import { Telegraf, Markup } from "telegraf";
import * as dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || "https://example.com";
const API_URL = process.env.API_URL || "http://localhost:3001/api";

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
      return ctx.reply("📊 Statistics unavailable. Please try again later.");
    }

    const data = (await response.json()) as {
      totalSessions: number;
      exams: { total: number; passed: number; passRate: number };
      questions: { totalAnswered: number; totalCorrect: number; correctRate: number };
    };

    return ctx.reply(
      `📊 Статистика (ID: ${userId}):\n\n` +
        `Пройдено тестов: ${data.exams.total}\n` +
        `Сдано экзаменов: ${data.exams.passed} (${data.exams.passRate}%)\n` +
        `Отвечено вопросов: ${data.questions.totalAnswered}\n` +
        `Правильных ответов: ${data.questions.totalCorrect} (${data.questions.correctRate}%)\n\n` +
        "Подробная статистика доступна в мини-приложении.",
    );
  } catch {
    return ctx.reply("📊 Statistics unavailable. Please try again later.");
  }
});

bot.launch().then(() => {
  console.log("🤖 Bot is running…");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

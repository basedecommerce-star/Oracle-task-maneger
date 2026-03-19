"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useTelegram } from "@/hooks/useTelegram";
import type { MenuItem } from "@/types";

const menuItems: MenuItem[] = [
  {
    title: "Обучение",
    icon: "📚",
    href: "/training",
    description: "Изучайте вопросы по темам",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Экзамен",
    icon: "📝",
    href: "/exam",
    description: "Сдайте пробный экзамен",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Билеты",
    icon: "🎫",
    href: "/tickets",
    description: "Решайте билеты по порядку",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Темы",
    icon: "📂",
    href: "/topics",
    description: "Вопросы по категориям",
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "Мои ошибки",
    icon: "❌",
    href: "/mistakes",
    description: "Работа над ошибками",
    color: "from-red-500 to-red-600",
  },
  {
    title: "Статистика",
    icon: "📊",
    href: "/stats",
    description: "Ваш прогресс",
    color: "from-teal-500 to-teal-600",
  },
  {
    title: "Правила ПДД",
    icon: "📖",
    href: "/rules",
    description: "Текст правил дорожного движения",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Дорожные знаки",
    icon: "🚸",
    href: "/signs",
    description: "Каталог дорожных знаков",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    title: "FAQ",
    icon: "❓",
    href: "/settings",
    description: "Частые вопросы",
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Настройки",
    icon: "⚙️",
    href: "/settings",
    description: "Язык и категория",
    color: "from-gray-500 to-gray-600",
  },
];

export default function HomePage() {
  const { user } = useTelegram();

  return (
    <main className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tg-text">
          ПДД Молдова 🇲🇩
        </h1>
        {user && (
          <p className="text-tg-hint text-sm mt-1">
            Привет, {user.first_name}! 👋
          </p>
        )}
        <p className="text-tg-subtitle text-sm mt-1">
          Подготовка к экзамену ПДД
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <Link key={`${item.title}-${item.href}`} href={item.href}>
            <Card hoverable className="h-full">
              <div className="flex flex-col items-start gap-2">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-tg-text text-sm">
                    {item.title}
                  </h3>
                  <p className="text-tg-hint text-xs mt-0.5 leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

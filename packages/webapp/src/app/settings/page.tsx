"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { Language, VehicleCategory } from "@/types";

const languages: { value: Language; label: string; flag: string }[] = [
  { value: "ro", label: "Română", flag: "🇲🇩" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
];

const vehicleCategories: { value: VehicleCategory; label: string; description: string }[] = [
  { value: "A", label: "Категория A", description: "Мотоциклы" },
  { value: "B", label: "Категория B", description: "Легковые автомобили" },
  { value: "C", label: "Категория C", description: "Грузовые автомобили" },
  { value: "D", label: "Категория D", description: "Автобусы" },
  { value: "E", label: "Категория E", description: "Прицепы" },
];

export default function SettingsPage() {
  const { language, category, setLanguage, setCategory } = useAppStore();
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.user.updateSettings({ language, category });
      hapticFeedback("notification", "success");
    } catch {
      console.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [language, category]);

  return (
    <>
      <Header title="Настройки" />
      <main className="px-4 pt-4 space-y-4">
        {/* Language */}
        <Card>
          <h3 className="font-semibold text-tg-text mb-3 text-sm">
            🌐 Язык / Limba
          </h3>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  hapticFeedback("selection");
                }}
                className={`
                  w-full text-left p-3 rounded-xl transition-colors text-sm flex items-center gap-3
                  ${language === lang.value
                    ? "bg-tg-button text-tg-button-text"
                    : "bg-tg-secondary-bg text-tg-text"
                  }
                `}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Vehicle Category */}
        <Card>
          <h3 className="font-semibold text-tg-text mb-3 text-sm">
            🚗 Категория транспорта
          </h3>
          <div className="space-y-2">
            {vehicleCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  hapticFeedback("selection");
                }}
                className={`
                  w-full text-left p-3 rounded-xl transition-colors text-sm
                  ${category === cat.value
                    ? "bg-tg-button text-tg-button-text"
                    : "bg-tg-secondary-bg text-tg-text"
                  }
                `}
              >
                <div className="font-medium">{cat.label}</div>
                <div className={`text-xs mt-0.5 ${
                  category === cat.value ? "text-tg-button-text/80" : "text-tg-hint"
                }`}>
                  {cat.description}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Button fullWidth onClick={handleSave} loading={saving}>
          Сохранить настройки
        </Button>

        {/* App Info */}
        <Card className="text-center">
          <p className="text-tg-hint text-xs">
            ПДД Молдова v0.1.0
          </p>
          <p className="text-tg-hint text-xs mt-1">
            Подготовка к экзамену ПДД Республики Молдова
          </p>
        </Card>
      </main>
    </>
  );
}

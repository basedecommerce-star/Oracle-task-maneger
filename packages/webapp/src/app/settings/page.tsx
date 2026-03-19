"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { Language, CategoryCode, Category } from "@/types";

const languages: { value: Language; label: string; flag: string }[] = [
  { value: "ro", label: "Română", flag: "🇲🇩" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function SettingsPage() {
  const { language, categoryCode, categoryId, setLanguage, setCategory } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [backendCategories, setBackendCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.categories.getAll();
        setBackendCategories(data);
      } catch {
        // Fallback: empty list, user sees nothing but can still save language
      }
    }
    loadCategories();
  }, []);

  const handleCategorySelect = useCallback(
    (cat: Category) => {
      setCategory(cat.code as CategoryCode, cat.id);
      hapticFeedback("selection");
    },
    [setCategory],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.user.updateSettings({
        languageCode: language,
        categoryId: categoryId ?? undefined,
      });
      hapticFeedback("notification", "success");
    } catch {
      console.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [language, categoryId]);

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
            {backendCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className={`
                  w-full text-left p-3 rounded-xl transition-colors text-sm
                  ${categoryCode === cat.code
                    ? "bg-tg-button text-tg-button-text"
                    : "bg-tg-secondary-bg text-tg-text"
                  }
                `}
              >
                <div className="font-medium">
                  Категория {cat.code}
                </div>
                <div className={`text-xs mt-0.5 ${
                  categoryCode === cat.code ? "text-tg-button-text/80" : "text-tg-hint"
                }`}>
                  {language === "ro" ? cat.nameRo : cat.nameRu}
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

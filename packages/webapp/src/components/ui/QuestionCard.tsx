"use client";

import { useState, useCallback } from "react";
import type { Question } from "@/types";
import { Button } from "./Button";

interface QuestionCardProps {
  question: Question;
  onAnswer: (optionId: string) => void;
  showExplanation?: boolean;
  disabled?: boolean;
  selectedOptionId?: string | null;
  onReport?: (questionId: string) => void;
}

export function QuestionCard({
  question,
  onAnswer,
  showExplanation = false,
  disabled = false,
  selectedOptionId: controlledSelected,
  onReport,
}: QuestionCardProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedOptionId = controlledSelected ?? internalSelected;
  const answered = selectedOptionId !== null;

  const handleSelect = useCallback(
    (optionId: string) => {
      if (answered || disabled) return;
      setInternalSelected(optionId);
      onAnswer(optionId);
    },
    [answered, disabled, onAnswer]
  );

  const getOptionStyle = (optionId: string) => {
    if (!answered) {
      return "bg-tg-secondary-bg text-tg-text active:bg-tg-button/20";
    }
    if (optionId === question.correctOptionId) {
      return "bg-green-500/20 text-green-700 border-green-500";
    }
    if (optionId === selectedOptionId && optionId !== question.correctOptionId) {
      return "bg-red-500/20 text-red-700 border-red-500";
    }
    return "bg-tg-secondary-bg text-tg-hint opacity-60";
  };

  return (
    <div className="space-y-4">
      {question.imageUrl && (
        <div className="w-full rounded-xl overflow-hidden bg-tg-secondary-bg">
          <img
            src={question.imageUrl}
            alt="Иллюстрация к вопросу"
            className="w-full h-auto object-contain max-h-48"
          />
        </div>
      )}

      <div className="text-tg-text font-medium text-base leading-relaxed">
        {question.text}
      </div>

      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={answered || disabled}
            className={`
              w-full text-left p-3.5 rounded-xl border-2 border-transparent
              transition-all duration-200 text-sm leading-snug
              disabled:cursor-default
              ${getOptionStyle(option.id)}
            `}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showExplanation && answered && question.explanation && (
        <div className="bg-tg-button/10 rounded-xl p-3.5 text-sm text-tg-text leading-relaxed">
          <span className="font-semibold">Пояснение: </span>
          {question.explanation}
        </div>
      )}

      {answered && onReport && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport(question.id)}
            className="text-tg-hint text-xs"
          >
            ⚠️ Сообщить об ошибке
          </Button>
        </div>
      )}
    </div>
  );
}

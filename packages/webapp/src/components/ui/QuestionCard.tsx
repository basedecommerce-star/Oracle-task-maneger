"use client";

import { useState, useCallback } from "react";
import type { Answer } from "@/types";
import { Button } from "./Button";

/** Common shape for displaying a question in training or exam mode */
export interface DisplayQuestion {
  id: string;
  questionText: string;
  imageAssetKey: string | null;
  answers: Answer[];
}

interface QuestionCardProps {
  question: DisplayQuestion;
  onAnswer: (answerId: string) => void;
  /** IDs of correct answers, set after server responds (training mode) */
  correctAnswerIds?: string[];
  /** Explanation text from server response (training mode) */
  explanationText?: string | null;
  showExplanation?: boolean;
  disabled?: boolean;
  selectedAnswerId?: string | null;
  onReport?: (questionId: string) => void;
}

export function QuestionCard({
  question,
  onAnswer,
  correctAnswerIds,
  explanationText,
  showExplanation = false,
  disabled = false,
  selectedAnswerId: controlledSelected,
  onReport,
}: QuestionCardProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedAnswerId = controlledSelected ?? internalSelected;
  const answered = selectedAnswerId !== null;
  const hasCorrectInfo = correctAnswerIds && correctAnswerIds.length > 0;

  const handleSelect = useCallback(
    (answerId: string) => {
      if (answered || disabled) return;
      setInternalSelected(answerId);
      onAnswer(answerId);
    },
    [answered, disabled, onAnswer],
  );

  const getOptionStyle = (answerId: string) => {
    if (!answered) {
      return "bg-tg-secondary-bg text-tg-text active:bg-tg-button/20";
    }
    if (hasCorrectInfo) {
      if (correctAnswerIds.includes(answerId)) {
        return "bg-green-500/20 text-green-700 border-green-500";
      }
      if (answerId === selectedAnswerId && !correctAnswerIds.includes(answerId)) {
        return "bg-red-500/20 text-red-700 border-red-500";
      }
    } else if (answerId === selectedAnswerId) {
      // Exam mode: just highlight selected, no correct/incorrect feedback
      return "bg-tg-button/20 text-tg-button border-tg-button";
    }
    return "bg-tg-secondary-bg text-tg-hint opacity-60";
  };

  return (
    <div className="space-y-4">
      {question.imageAssetKey && (
        <div className="w-full rounded-xl overflow-hidden bg-tg-secondary-bg">
          <img
            src={question.imageAssetKey}
            alt="Иллюстрация к вопросу"
            className="w-full h-auto object-contain max-h-48"
          />
        </div>
      )}

      <div className="text-tg-text font-medium text-base leading-relaxed">
        {question.questionText}
      </div>

      <div className="space-y-2">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleSelect(answer.id)}
            disabled={answered || disabled}
            className={`
              w-full text-left p-3.5 rounded-xl border-2 border-transparent
              transition-all duration-200 text-sm leading-snug
              disabled:cursor-default
              ${getOptionStyle(answer.id)}
            `}
          >
            {answer.answerText}
          </button>
        ))}
      </div>

      {showExplanation && answered && explanationText && (
        <div className="bg-tg-button/10 rounded-xl p-3.5 text-sm text-tg-text leading-relaxed">
          <span className="font-semibold">Пояснение: </span>
          {explanationText}
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

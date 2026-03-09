import { Question } from '@/data/questions';
import ReactMarkdown from 'react-markdown';

interface QuizSectionProps {
  question: Question | null;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  visible: boolean;
}

export default function QuizSection({
  question,
  currentQuestion,
  totalQuestions,
  onAnswer,
  visible,
}: QuizSectionProps) {
  if (!visible || !question) return null;

  return (
    <div className="p-4 border-t">
      <div className="text-sm text-[#696eff] mb-2">
        Question {currentQuestion + 1}/{totalQuestions}
      </div>
      <div className="text-lg mb-4 prose max-w-none">
        <ReactMarkdown>{question.question}</ReactMarkdown>
      </div>
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors prose-sm prose-p:my-0"
          >
            <ReactMarkdown>{option.label}</ReactMarkdown>
          </button>
        ))}
      </div>
    </div>
  );
}

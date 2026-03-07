interface QuestionCountSelectionProps {
  onSelect: (count: number) => void;
  visible: boolean;
}

export default function QuestionCountSelection({ onSelect, visible }: QuestionCountSelectionProps) {
  if (!visible) return null;

  return (
    <div className="p-4 border-t">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => onSelect(5)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-800"
        >
          5 Pertanyaan
        </button>
        <button
          onClick={() => onSelect(10)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-800"
        >
          10 Pertanyaan
        </button>
        <button
          onClick={() => onSelect(15)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-800"
        >
          15 Pertanyaan
        </button>
      </div>
    </div>
  );
}

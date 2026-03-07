import { Topic } from '@/data/questions';

interface TopicSelectionProps {
  topics: Topic[];
  onSelect: (topicId: string) => void;
  visible: boolean;
}

export default function TopicSelection({ topics, onSelect, visible }: TopicSelectionProps) {
  if (!visible) return null;

  return (
    <div className="p-4 border-t">
      <div className="text-sm text-[#101010] opacity-80 mb-4 flex justify-center">
        Pilih satu minat belajar
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic.id)}
            className="flex items-center gap-2 rounded-full px-4 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-[#101010]"
          >
            <span>{topic.icon}</span> {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}

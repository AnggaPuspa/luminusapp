interface ChatMessageProps {
  content: string;
  isBot?: boolean;
}

export default function ChatMessage({ content, isBot = true }: ChatMessageProps) {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-end w-full ${isBot ? 'space-x-2' : 'space-x-reverse space-x-2 flex-row-reverse'}`}>
        <div
          className={`max-w-[60%] rounded-lg p-3 ${
            isBot
              ? 'bg-[#696EFF] text-white rounded-bl-none'
              : 'bg-gray-100 text-gray-800 rounded-br-none'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

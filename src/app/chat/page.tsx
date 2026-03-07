'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from '@/components/common';
import {
  ChatHeader,
  ChatMessage,
  TopicSelection,
  QuestionCountSelection,
  QuizSection,
  CourseRecommendation,
} from '@/components/chat';
import { topics, questions, CONSTANTS, Question } from '@/data/questions';
import '@/styles/chat.css';
import '@/styles/common.css';

interface Message {
  content: string;
  isBot: boolean;
}

interface Course {
  title: string;
  rating: string;
  level: string;
  image: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showTopicSelection, setShowTopicSelection] = useState(false);
  const [showQuestionCount, setShowQuestionCount] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const [currentTopic, setCurrentTopic] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [score, setScore] = useState(0);
  const [course, setCourse] = useState<Course | null>(null);

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const addMessage = (content: string, isBot: boolean = true) => {
    setMessages((prev) => [...prev, { content, isBot }]);
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat
    addMessage('Halo! Saya akan membantu kamu menemukan kelas yang tepat berdasarkan minat belajar kamu.');
    setTimeout(() => {
      addMessage('Topik apa yang ingin kamu kuasai?');
      setShowTopicSelection(true);
    }, CONSTANTS.DELAY);
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setCurrentTopic(topicId);
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      addMessage(`${topic.icon} ${topic.label}`, false);
    }
    setShowTopicSelection(false);

    setTimeout(() => {
      addMessage('Bagus! Berapa banyak pertanyaan yang ingin kamu jawab?');
      setShowQuestionCount(true);
    }, CONSTANTS.DELAY);
  };

  const handleQuestionCountSelect = (count: number) => {
    setTotalQuestions(count);
    setShowQuestionCount(false);
    addMessage(`${count} questions`, false);

    setTimeout(() => {
      addMessage(`Sempurna! Mari kita mulai dengan ${count} pertanyaan.`);
      setCurrentQuestion(0);
      setScore(0);
      setShowQuiz(true);
    }, CONSTANTS.DELAY);
  };

  const getCurrentQuestion = (): Question | null => {
    if (!currentTopic || !questions[currentTopic]) return null;
    const topicQuestions = questions[currentTopic];
    return topicQuestions[currentQuestion % topicQuestions.length];
  };

  const handleAnswer = (answer: string) => {
    const question = getCurrentQuestion();
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.value === answer);
    if (selectedOption) {
      addMessage(selectedOption.label, false);
    }

    let newScore = score;
    if (answer === question.correct) {
      newScore = score + 1;
      setScore(newScore);
    }

    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    setShowQuiz(false);

    if (nextQuestion < totalQuestions) {
      setTimeout(() => {
        setShowQuiz(true);
      }, CONSTANTS.DELAY);
    } else {
      setTimeout(() => {
        showCourseRecommendation(newScore);
      }, CONSTANTS.DELAY);
    }
  };

  const showCourseRecommendation = (finalScore: number) => {
    const percentage = (finalScore / totalQuestions) * 100;
    let level: string;
    let courseData: Course;

    if (percentage >= CONSTANTS.SCORE_THRESHOLDS.ADVANCED) {
      level = 'Advanced';
      courseData = {
        title: `${currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)} Expert Course`,
        rating: '4.9',
        level,
        image: `/images/${currentTopic}.png`,
      };
    } else if (percentage >= CONSTANTS.SCORE_THRESHOLDS.INTERMEDIATE) {
      level = 'Intermediate';
      courseData = {
        title: `Intermediate ${currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}`,
        rating: '4.7',
        level,
        image: `/images/${currentTopic}.png`,
      };
    } else {
      level = 'Beginner';
      courseData = {
        title: `${currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)} Fundamentals`,
        rating: '4.5',
        level,
        image: `/images/${currentTopic}.png`,
      };
    }

    addMessage(`Based on your responses, you are at a ${level} level. Here's a recommended course:`);
    setCourse(courseData);
    setShowRecommendation(true);
  };

  const handleReset = () => {
    setMessages([]);
    setShowTopicSelection(false);
    setShowQuestionCount(false);
    setShowQuiz(false);
    setShowRecommendation(false);
    setCurrentTopic('');
    setCurrentQuestion(0);
    setTotalQuestions(5);
    setScore(0);
    setCourse(null);

    // Re-initialize
    setTimeout(() => {
      addMessage('Halo! Saya akan membantu kamu menemukan kelas yang tepat berdasarkan minat belajar kamu.');
      setTimeout(() => {
        addMessage('Topik apa yang ingin kamu kuasai?');
        setShowTopicSelection(true);
      }, CONSTANTS.DELAY);
    }, 100);
  };

  return (
    <>
      <div className="w-full md:w-[80%] mx-auto h-screen flex items-center justify-center">
        <div className="w-full h-full md:p-3 flex flex-col">
          <ChatHeader onReset={handleReset} />

          <div className="bg-white h-full md:h-auto pt-3 md:rounded-b-2xl overflow-hidden">
            <div className="h-full md:h-[38rem] flex flex-col">
              {/* Chat messages */}
              <div
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              >
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    content={message.content}
                    isBot={message.isBot}
                  />
                ))}
              </div>

              {/* Topic selection */}
              <TopicSelection
                topics={topics}
                onSelect={handleTopicSelect}
                visible={showTopicSelection}
              />

              {/* Question count selection */}
              <QuestionCountSelection
                onSelect={handleQuestionCountSelect}
                visible={showQuestionCount}
              />

              {/* Quiz section */}
              <QuizSection
                question={getCurrentQuestion()}
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
                onAnswer={handleAnswer}
                visible={showQuiz}
              />

              {/* Course recommendation */}
              <CourseRecommendation course={course} visible={showRecommendation} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

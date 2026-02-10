import React, { useState } from 'react';
import { MessageCircleQuestion, X, Send } from 'lucide-react';
import { askElder } from '../services/geminiService';

interface GeminiAssistantProps {
  gameContext: string;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ gameContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const response = await askElder(question, gameContext);
      setAnswer(response);
    } catch (e) {
      setAnswer("Có lỗi xảy ra khi liên lạc với Trưởng Làng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-primary text-white p-4 rounded-full shadow-xl hover:bg-primary-hover transition-transform hover:scale-110 active:scale-95"
        title="Hỏi Luật"
      >
        <MessageCircleQuestion size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                Trưởng Làng
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {answer ? (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-text-muted opacity-50">
                  <MessageCircleQuestion size={40} className="mb-2" />
                  <p className="text-sm">Hỏi về luật chơi...</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-surface/50 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Sói có được cắn nhau không?"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
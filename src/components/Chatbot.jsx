import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Minimize2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Chatbot({ chatData }) {
  const { theme } = useTheme();
  const { messages, isTyping, isOpen, sendMessage, clearChat, toggleChat } = chatData;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          id="chatbot-toggle"
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer glow"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border overflow-hidden animate-slide-up flex flex-col ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700/50'
              : 'bg-white border-slate-200'
          }`}
          style={{ height: '520px' }}
          role="dialog"
          aria-label="AI Chat Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Dashboard AI</h3>
                <p className="text-xs opacity-75">Mistral-7B • Live Data</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close chat"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <Bot
                    className={`w-8 h-8 ${
                      theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                    }`}
                  />
                </div>
                <h4
                  className={`text-sm font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Dashboard Assistant
                </h4>
                <p
                  className={`text-xs max-w-[220px] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Ask me about ISS position, speed, or current news headlines.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['Where is the ISS?', 'What are the news?', 'ISS speed?'].map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} theme={theme} />
            ))}

            {isTyping && <TypingIndicator theme={theme} />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`shrink-0 p-3 border-t ${
              theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'
            }`}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                id="chatbot-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ISS or news..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary-500'
                }`}
                aria-label="Type a message"
                disabled={isTyping}
              />
              <button
                id="chatbot-send"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message, theme }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-primary-600'
            : theme === 'dark'
            ? 'bg-slate-700'
            : 'bg-slate-200'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot
            className={`w-3.5 h-3.5 ${
              theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
            }`}
          />
        )}
      </div>
      <div
        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-md'
            : theme === 'dark'
            ? 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700/50'
            : 'bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
}

function TypingIndicator({ theme }) {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
        }`}
      >
        <Bot
          className={`w-3.5 h-3.5 ${
            theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
          }`}
        />
      </div>
      <div
        className={`px-4 py-3 rounded-2xl rounded-bl-md ${
          theme === 'dark'
            ? 'bg-slate-800 border border-slate-700/50'
            : 'bg-slate-100 border border-slate-200'
        }`}
      >
        <div className="flex gap-1.5">
          <span
            className={`w-2 h-2 rounded-full typing-dot ${
              theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
            }`}
          />
          <span
            className={`w-2 h-2 rounded-full typing-dot ${
              theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
            }`}
          />
          <span
            className={`w-2 h-2 rounded-full typing-dot ${
              theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

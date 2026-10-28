import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Trash2, Bot, User, Phone, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';
import { Language } from '../utils/i18n';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface AiChatWidgetProps {
  lang?: Language;
  onToggleLang?: () => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ lang: initialLang = 'en', onToggleLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatLang, setChatLang] = useState<Language>(initialLang);

  useEffect(() => {
    setChatLang(initialLang);
  }, [initialLang]);

  const handleToggleChatLang = () => {
    const next = chatLang === 'en' ? 'bn' : 'en';
    setChatLang(next);
    if (onToggleLang) {
      onToggleLang();
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text:
        initialLang === 'bn'
          ? 'আসসালামু আলাইকুম! MediStock-এ আপনাকে স্বাগতম। আমি আপনার এআই ফার্মেসি সহায়ক। কীভাবে সাহায্য করতে পারি?'
          : 'Hello! Welcome to MediStock. I am your AI pharmacy assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHumanModal, setShowHumanModal] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const quickQuestions =
    chatLang === 'bn'
      ? [
          'ওষুধ খুঁজুন (Find medicine)',
          'অর্ডারের অবস্থা (Order status)',
          'ডেলিভারি তথ্য (Delivery info)',
          'পেমেন্ট পদ্ধতি (Payment methods)',
          'কাস্টমার সাপোর্টের সঙ্গে কথা বলুন',
        ]
      : [
          'Find a medicine',
          'Check order status',
          'Delivery information',
          'Payment methods',
          'Talk to customer support',
        ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setLoading(true);
    setLastFailedMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang: chatLang }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.reply || data.error || 'Server error');
      }

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || (chatLang === 'bn' ? 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' : 'Sorry, no response received.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorText = isTimeout
        ? chatLang === 'bn'
          ? 'অনুরোধের সময়সীমা শেষ হয়ে গেছে (Timeout)। দয়া করে আবার চেষ্টা করুন।'
          : 'Request timed out. Please check your network and try again.'
        : chatLang === 'bn'
        ? 'সার্ভার সংযোগে ত্রুটি হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
        : 'Connection error. Please try again in a moment.';

      const errReply: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errReply]);
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-full bg-[#123B5D] hover:bg-[#1b4b74] px-5 py-3.5 text-white shadow-2xl transition-all hover:scale-105 border-2 border-[#079B8C]"
          title="Ask MediStock AI"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#079B8C] text-white">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-wide text-[#DDF6EF]">Ask MediStock AI</div>
            <div className="text-[10px] text-slate-300">24/7 Pharmacy Assistant</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#123B5D] text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#079B8C] text-white flex items-center justify-center shadow-inner">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">MediStock AI Support</span>
                  <Sparkles className="h-3.5 w-3.5 text-[#DDF6EF]" />
                </div>
                <div className="text-[10px] text-teal-200 font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Fast Response (Gemini 3.8)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleChatLang}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 border border-white/20"
                title="Switch Language"
              >
                {chatLang === 'en' ? 'বাংলা' : 'English'}
              </button>
              <button
                onClick={() => setClearConfirm(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                title="Clear Chat History"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Clear Chat Confirmation Modal */}
          {clearConfirm && (
            <div className="absolute inset-x-4 top-20 z-20 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 text-center space-y-3">
              <p className="text-xs font-bold text-slate-800">Clear all conversation history?</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: 'msg-welcome',
                        sender: 'ai',
                        text:
                          chatLang === 'bn'
                            ? 'ইতিহাস মুছে ফেলা হয়েছে। কীভাবে সাহায্য করতে পারি?'
                            : 'Conversation cleared. How can I help you?',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ]);
                    setClearConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F3F7FA] text-xs">
            <div className="text-center py-2">
              <span className="rounded-full bg-slate-200/60 px-3 py-1 text-[10px] text-slate-500 font-mono">
                AI Assistant · DGDA Verified Information
              </span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-full bg-[#079B8C] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-xs space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-[#123B5D] text-white rounded-tr-xs'
                      : m.isError
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                      : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-between pt-1">
                    {m.isError && lastFailedMessage && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-700 hover:underline bg-rose-100 px-2 py-0.5 rounded"
                      >
                        <RefreshCcw className="h-3 w-3" /> Retry
                      </button>
                    )}
                    <div
                      className={`text-[9px] font-mono ml-auto ${
                        m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-[#123B5D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="h-6 w-6 rounded-full bg-[#079B8C] text-white flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#079B8C] animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#079B8C] animate-pulse [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#079B8C] animate-pulse [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 ml-1">MediStock AI is generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap rounded-full bg-[#DDF6EF]/60 hover:bg-[#DDF6EF] text-[#079B8C] border border-[#079B8C]/30 px-3 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder={chatLang === 'bn' ? 'আপনার প্রশ্ন এখানে লিখুন...' : 'Type your question here...'}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 bg-[#F3F7FA] px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C] disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputVal.trim()}
                className="rounded-xl bg-[#079B8C] hover:bg-[#058276] text-white p-2.5 transition-colors disabled:opacity-50 shadow-sm"
                title="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>MediStock AI v2.5</span>
              <button
                onClick={() => setShowHumanModal(true)}
                className="text-[#079B8C] font-bold hover:underline flex items-center gap-1"
              >
                <Phone className="h-3 w-3" /> Talk to Human Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human Support Handoff Modal */}
      {showHumanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#123B5D]">Human Support Hotline</h3>
              <button
                onClick={() => setShowHumanModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p>Our licensed pharmacists and customer support executives are available 24/7:</p>
              <div className="bg-[#F3F7FA] p-3.5 rounded-2xl border border-slate-200 space-y-2 font-mono">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="h-4 w-4 text-[#079B8C]" />
                  <span>+880 9612-345678 (Hotline)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="text-base">📧</span>
                  <span>support@medistock.com.bd</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                You can also submit a prescription inquiry through your customer order dashboard.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHumanModal(false)}
                className="rounded-xl bg-[#123B5D] text-white px-5 py-2 font-bold text-xs shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

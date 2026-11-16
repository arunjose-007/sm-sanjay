import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, X, AlertCircle, CheckCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import { api } from '../services/api';

export default function AIAssistantWidget({
  isOpen,
  onClose,
  moduleContext = 'general',
  currentUser
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your Intelligent Assistant. Ask me anything about job schemes, marine weather, fishing advisories, or road safety.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      checkOllama();
      loadHistory();
    }
  }, [isOpen, moduleContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const checkOllama = async () => {
    setCheckingStatus(true);
    try {
      const status = await api.getAIStatus();
      setAiStatus(status);
    } catch (e) {
      setAiStatus({
        online: false,
        message: 'Could not connect to backend AI bridge.'
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.getChatHistory(currentUser?.id, moduleContext);
      if (res.messages && res.messages.length > 0) {
        const formatted = [];
        res.messages.forEach((m, idx) => {
          formatted.push({
            id: `hist-u-${idx}`,
            sender: 'user',
            text: m.user_message,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          formatted.push({
            id: `hist-a-${idx}`,
            sender: 'ai',
            text: m.ai_response,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
        setMessages(formatted);
      }
    } catch (e) {
      // Use initial message if history load fails
    }
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setLoading(true);

    try {
      const historyContext = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.chatWithAI(
        textToSend,
        moduleContext,
        historyContext,
        currentUser?.id
      );

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.response || "No response received.",
        source: res.offline_source,
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        isError: true,
        text: err.data?.error || err.message || "Failed to contact local Ollama service. Please check if Ollama is running.",
        instructions: err.data?.instructions,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChatHistory();
      setMessages([
        {
          id: Date.now(),
          sender: 'ai',
          text: "Chat history cleared. How can I help you today?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {}
  };

  if (!isOpen) return null;

  const quickPrompts = {
    fisherman: [
      "What is the best time for fishing?",
      "Current wave height safety guidelines?",
      "Coast guard distress frequency?"
    ],
    driver: [
      "Find nearest 24/7 trauma care hospital",
      "Highway night driving precautions",
      "Road safety emergency helpline numbers"
    ],
    livelihood: [
      "Eligibility criteria for PM-KISAN?",
      "How to apply for PMMSY fishery subsidy?",
      "Free agricultural drone skill certification"
    ],
    general: [
      "What services does this app provide?",
      "How does offline AI work with Ollama?",
      "Emergency SOS action steps"
    ]
  };

  const currentPrompts = quickPrompts[moduleContext] || quickPrompts.general;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[94vw] sm:w-[460px] h-[550px] max-h-[85vh] rounded-2xl glass-panel border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      
      {/* Top Header matching reference image: [Bot Icon] AI Assistant [Close] */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-sky-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AI Assistant</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 capitalize">
                {moduleContext}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${aiStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-400">
                {aiStatus?.online ? `Ollama (${aiStatus.configured_model})` : 'Ollama Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={checkOllama}
            title="Refresh Ollama status"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ollama Status Alert if Offline */}
      {aiStatus && !aiStatus.online && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-3 py-2 text-[11px] text-amber-200 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span>Local Ollama is not detected at <code>localhost:11434</code>. Run in terminal:</span>
            <div className="font-mono bg-black/40 text-sky-300 px-2 py-0.5 rounded mt-1 select-all border border-sky-500/20">
              ollama run llama3.2:3b
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[85%]">
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                </div>
              )}
              
              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/30'
                    : msg.isError
                    ? 'bg-red-950/70 border border-red-500/40 text-red-200 rounded-bl-none'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.instructions && (
                  <div className="mt-2 pt-2 border-t border-red-500/30 font-mono text-[11px] text-red-300 whitespace-pre-wrap">
                    {msg.instructions}
                  </div>
                )}
                {msg.source && (
                  <div className="mt-1 text-[9px] text-sky-400/70 text-right">
                    via {msg.source}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs rounded-bl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
              <span className="ml-1 text-[11px] text-slate-400">Ollama is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        {currentPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-200 border border-slate-700 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar matching reference image: [Type your question...] [Send >] */}
      <div className="p-3 bg-slate-900/90 border-t border-sky-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition shadow-md shadow-blue-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

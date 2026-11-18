import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Trash2, X, AlertCircle, CheckCircle2, RefreshCw, 
  Sparkles, Zap, Cpu, Compass, CloudSun, Sprout, Fish, Truck, 
  PhoneCall, Briefcase, Landmark, Copy, Square, Plus, MessageSquare,
  ChevronDown, ChevronRight, Menu, Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

// Safe & Lightweight Custom Markdown Renderer for Code, Bold, Lists, Links, Quotes
function FormattedMessage({ content }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!content) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'plaintext',
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const renderInlineFormatted = (rawText) => {
    // Process lines for headers, lists, quotes, inline code, bold, links
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="text-xs sm:text-sm font-bold text-cyan-300 mt-2 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {renderSpans(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={lIdx} className="text-sm sm:text-base font-extrabold text-white mt-2.5 mb-1.5">
            {renderSpans(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={lIdx} className="text-base sm:text-lg font-black text-white mt-3 mb-2 border-b border-cyan-500/20 pb-1">
            {renderSpans(trimmed.substring(2))}
          </h2>
        );
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={lIdx} className="border-l-2 border-cyan-500/70 pl-2.5 my-1 text-slate-300 italic bg-cyan-950/20 py-0.5 rounded-r">
            {renderSpans(trimmed.substring(2))}
          </blockquote>
        );
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={lIdx} className="flex items-start gap-2 ml-1.5 my-0.5">
            <span className="text-cyan-400 font-bold mt-0.5 leading-none">•</span>
            <span className="flex-1">{renderSpans(trimmed.substring(2))}</span>
          </div>
        );
      }

      // Numbered lists: e.g. "1. " or "2. "
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={lIdx} className="flex items-start gap-2 ml-1.5 my-0.5">
            <span className="text-cyan-400 font-semibold text-[11px] min-w-[16px]">{numMatch[1]}.</span>
            <span className="flex-1">{renderSpans(numMatch[2])}</span>
          </div>
        );
      }

      // Empty line
      if (trimmed === '') {
        return <div key={lIdx} className="h-1.5" />;
      }

      // Standard paragraph line
      return (
        <div key={lIdx} className="my-0.5">
          {renderSpans(line)}
        </div>
      );
    });
  };

  const renderSpans = (text) => {
    // Process `inline code`, **bold**, [link](url)
    const elements = [];
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m;

    while ((m = inlineRegex.exec(text)) !== null) {
      if (m.index > last) {
        elements.push(text.substring(last, m.index));
      }
      const token = m[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        elements.push(
          <code key={m.index} className="bg-slate-800/90 text-cyan-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-cyan-500/20">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        elements.push(
          <strong key={m.index} className="text-white font-bold">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          elements.push(
            <a
              key={m.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium inline-flex items-center gap-0.5"
            >
              {linkMatch[1]}
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          );
        }
      }
      last = m.index + token.length;
    }
    if (last < text.length) {
      elements.push(text.substring(last));
    }
    return elements;
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-200">
      {parts.map((p, idx) => {
        if (p.type === 'code') {
          return (
            <div key={idx} className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
                <span className="uppercase font-semibold tracking-wider text-cyan-400">{p.lang}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(p.code, idx)}
                  className="flex items-center gap-1 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-slate-100 overflow-x-auto text-[11px] leading-5 whitespace-pre">
                <code>{p.code}</code>
              </pre>
            </div>
          );
        }
        return <div key={idx}>{renderInlineFormatted(p.value)}</div>;
      })}
    </div>
  );
}

export default function AIAssistantWidget({
  isOpen,
  onClose,
  moduleContext = 'general',
  currentUser
}) {
  // Conversations State (ChatGPT Style)
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Models & Engines State
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [aiStatus, setAIStatus] = useState(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [abortController, setAbortController] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load models catalog and status on mount
  const refreshAIInfo = async () => {
    setIsRefreshingStatus(true);
    try {
      const [modelsData, statusData] = await Promise.all([
        api.getAIModels().catch(() => null),
        api.getAIStatus().catch(() => null)
      ]);
      if (modelsData?.models) {
        setAvailableModels(modelsData.models);
      }
      if (statusData) {
        setAIStatus(statusData);
      }
    } catch (e) {
      // fallback
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Load conversations list from backend
  const loadConversations = async () => {
    try {
      const res = await api.getConversations(currentUser?.id);
      if (res?.conversations) {
        setConversations(res.conversations);
        // If no active conversation, pick the first one or start fresh
        if (!currentConversationId && res.conversations.length > 0) {
          selectConversation(res.conversations[0].id);
        }
      }
    } catch (e) {
      // quiet fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshAIInfo();
      loadConversations();
    }
  }, [isOpen, currentUser]);

  // Select a conversation from sidebar
  const selectConversation = async (convId) => {
    setCurrentConversationId(convId);
    setShowSidebar(false);
    try {
      const res = await api.getConversation(convId);
      if (res?.conversation) {
        const mapped = (res.conversation.messages || []).map(m => ({
          id: m.id || Math.random(),
          sender: m.role === 'user' ? 'user' : 'ai',
          text: m.content,
          model: m.model,
          provider: m.provider
        }));
        setMessages(mapped);
      }
    } catch (e) {
      // fallback
    }
  };

  // Start a fresh new chat
  const handleNewChat = async () => {
    try {
      const res = await api.createConversation({
        title: 'New Chat',
        module_context: moduleContext,
        model: selectedModel,
        user_id: currentUser?.id
      });
      if (res?.conversation) {
        setConversations(prev => [res.conversation, ...prev]);
        setCurrentConversationId(res.conversation.id);
        setMessages([]);
        setShowSidebar(false);
      }
    } catch (e) {
      setCurrentConversationId(null);
      setMessages([]);
      setShowSidebar(false);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversationId === convId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      // fallback
    }
  };

  // Stop Generation Handler
  const handleStopGenerating = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
  };

  // Copy message text to clipboard
  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Send Message (Streaming by default)
  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isStreaming) return;

    let convId = currentConversationId;
    if (!convId) {
      try {
        const createRes = await api.createConversation({
          title: textToSend.slice(0, 30),
          module_context: moduleContext,
          model: selectedModel,
          user_id: currentUser?.id
        });
        if (createRes?.conversation) {
          convId = createRes.conversation.id;
          setCurrentConversationId(convId);
          setConversations(prev => [createRes.conversation, ...prev]);
        }
      } catch (e) {
        // proceed without convId
      }
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    // Placeholder for AI streaming message
    const aiMsgId = Date.now() + 1;
    const aiPlaceholder = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      model: selectedModel,
      provider: 'Generating...',
      streaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    const controller = new AbortController();
    setAbortController(controller);
    const startTime = Date.now();

    const historyPayload = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      await api.streamAIChat({
        message: userMsg.text,
        moduleContext,
        history: historyPayload,
        userId: currentUser?.id,
        selectedModel,
        conversationId: convId,
        signal: controller.signal,
        onChunk: (chunk, meta) => {
          setMessages(prev =>
            prev.map(m => {
              if (m.id === aiMsgId) {
                return {
                  ...m,
                  text: m.text + chunk,
                  model: meta?.model || m.model,
                  provider: meta?.provider || m.provider
                };
              }
              return m;
            })
          );
        },
        onDone: (meta) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          setMessages(prev =>
            prev.map(m => {
              if (m.id === aiMsgId) {
                return {
                  ...m,
                  streaming: false,
                  elapsed: `${elapsed}s`,
                  model: meta?.model || m.model,
                  provider: meta?.provider || m.provider
                };
              }
              return m;
            })
          );
          setIsStreaming(false);
          setAbortController(null);
          // Refresh conversation list to get updated title
          loadConversations();
        },
        onError: (err) => {
          setMessages(prev =>
            prev.map(m => {
              if (m.id === aiMsgId) {
                return {
                  ...m,
                  streaming: false,
                  text: m.text || `Service Error: ${err.message}. Check your local Ollama or xAI Grok settings.`,
                  isError: !m.text
                };
              }
              return m;
            })
          );
          setIsStreaming(false);
          setAbortController(null);
        }
      });
    } catch (err) {
      setMessages(prev =>
        prev.map(m => {
          if (m.id === aiMsgId) {
            return {
              ...m,
              streaming: false,
              text: m.text || `Unable to reach backend: ${err.message}`,
              isError: true
            };
          }
          return m;
        })
      );
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (isStreaming) return;
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setMessages(prev => {
        const lastIdx = prev.map(m => m.sender).lastIndexOf('ai');
        if (lastIdx !== -1) {
          return prev.slice(0, lastIdx);
        }
        return prev;
      });
      handleSend(lastUserMsg.text);
    }
  };

  if (!isOpen) return null;

  // Starters cards for empty chat state
  const starterPrompts = [
    {
      title: "🌤️ Live Climate & Weather",
      desc: "Real-time live temperature, rain, wind & 5-day forecast for today.",
      prompt: "What is today's climate in Chennai? Give me the verified live weather report for today (18-11-2026)."
    },
    {
      title: "💻 Free AI & Python Coding",
      desc: "Qwen 2.5 Coder & DeepSeek R1 for algorithms and debugging.",
      prompt: "Write a complete Python script to track GPS coordinates, calculate distance between waypoints, and find the nearest emergency hospital."
    },
    {
      title: "🛣️ Highway Road Safety",
      desc: "Night driving, heavy fog, and emergency breakdown rules.",
      prompt: "What are the essential defensive highway driving precautions for driving during heavy rain, fog, and night hours?"
    },
    {
      title: "🌊 Fishermen Sea Advisory",
      desc: "Marine weather, Beaufort wind scale & Coast Guard 1554.",
      prompt: "What safety protocols and emergency communication equipment should coastal fishermen prepare before heading out into the deep sea?"
    },
    {
      title: "🏛️ Government Welfare Schemes",
      desc: "PM-KISAN, PMMSY Fisheries, PM SVANidhi, and Mudra loans.",
      prompt: "Explain the eligibility, subsidy amount, and step-by-step application procedure for PM-KISAN and PMMSY fisheries scheme."
    },
    {
      title: "🚨 Emergency Helplines & SOS",
      desc: "All 4 registered helpline numbers & hospital response.",
      prompt: "List all official emergency helpline phone numbers registered in this app and the immediate first-aid steps for road accidents."
    }
  ];

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-2 sm:inset-4 w-auto h-auto' 
        : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[680px] md:w-[740px] h-[640px] max-h-[90vh]'
    } glass-panel rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/40 flex flex-col bg-[#070e1d]/95 backdrop-blur-2xl text-slate-100`}>
      
      {/* Top Main Navigation Bar */}
      <div className="bg-slate-950/95 px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
        
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            title="Chat History"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
            {conversations.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">AI Assistant</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  ChatGPT & Grok
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Model Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition cursor-pointer appearance-none max-w-[200px] sm:max-w-[260px] truncate"
            >
              <option value="auto">✨ Auto (Best Free Engine)</option>
              
              {availableModels.filter(m => m.provider === 'ollama').length > 0 && (
                <optgroup label="🦙 Ollama Local AI (100% Free & Private)">
                  {availableModels.filter(m => m.provider === 'ollama').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              )}

              {availableModels.filter(m => m.provider === 'groq').length > 0 && (
                <optgroup label="⚡ Free Cloud AI (Groq LPUs - Ultra Fast)">
                  {availableModels.filter(m => m.provider === 'groq').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              )}

              {availableModels.filter(m => m.provider === 'gemini').length > 0 && (
                <optgroup label="✨ Google Gemini (Free Cloud)">
                  {availableModels.filter(m => m.provider === 'gemini').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              )}

              {availableModels.filter(m => m.provider === 'openrouter').length > 0 && (
                <optgroup label="🌐 OpenRouter (Free Tier)">
                  {availableModels.filter(m => m.provider === 'openrouter').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              )}

              {availableModels.filter(m => m.provider === 'xai').length > 0 && (
                <optgroup label="☁️ xAI Grok (Cloud API)">
                  {availableModels.filter(m => m.provider === 'xai').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={refreshAIInfo}
            title="Refresh AI engine status"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition mr-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Restore Size" : "Maximize"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Main Container with Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Collapsible Left History Sidebar (ChatGPT Style) */}
        <div className={`absolute sm:relative z-20 h-full w-64 bg-slate-950/95 sm:bg-slate-950/70 border-r border-cyan-500/20 flex flex-col transition-all duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full sm:hidden'
        }`}>
          {/* New Chat Button */}
          <div className="p-3 border-b border-slate-800">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Recent Chats
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 px-3">
                No conversations yet. Start a new chat anytime!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === currentConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate text-xs">{conv.title || 'Conversation'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      title="Delete chat"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: Engine Status Badges */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">xAI Grok Cloud:</span>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                aiStatus?.xai_grok?.configured 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-950 text-amber-400 border border-amber-500/30'
              }`}>
                {aiStatus?.xai_grok?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ollama Local:</span>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                aiStatus?.ollama?.online 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-950 text-red-400 border border-red-500/30'
              }`}>
                {aiStatus?.ollama?.online ? `${aiStatus.ollama.installed_count || 0} Models` : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Main Chat Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/50">

          {/* Messages Stream */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin">
            
            {messages.length === 0 ? (
              // Empty State - ChatGPT Style Welcome Hero & Capability Starter Cards
              <div className="max-w-2xl mx-auto py-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-xl mb-1">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    How can I assist you today?
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Ask anything about Python coding, mathematical reasoning, highway defensive driving, coastal marine weather, PM-KISAN schemes, or emergency SOS.
                  </p>
                </div>

                {/* 6 Starter Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {starterPrompts.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.prompt)}
                      className="p-3 rounded-2xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition group shadow-sm flex flex-col justify-between"
                    >
                      <div className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 mb-1">
                        {card.title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug">
                        {card.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages Feed
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : m.isError
                      ? 'bg-red-950/80 text-red-200 border border-red-500/40 rounded-bl-none'
                      : 'bg-slate-900/95 border border-slate-700/70 text-slate-100 rounded-bl-none shadow-lg'
                  }`}>
                    
                    {/* Assistant Message Header Meta */}
                    {m.sender === 'ai' && !m.isError && (
                      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/80 text-[10px] text-slate-400 font-mono">
                        <span className="font-semibold text-cyan-300 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-cyan-400" />
                          {m.model || selectedModel}
                        </span>
                        <div className="flex items-center gap-2">
                          {m.elapsed && (
                            <span className="text-emerald-400 font-bold">⚡ {m.elapsed}</span>
                          )}
                          <span className="text-slate-500">{m.provider || 'AI Engine'}</span>
                        </div>
                      </div>
                    )}

                    {/* Content (Formatted Markdown) */}
                    <FormattedMessage content={m.text} />

                    {/* Blinking Cursor during live streaming */}
                    {m.streaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5 align-middle"></span>
                    )}

                    {/* Action Bar under AI Message (Copy / Regenerate) */}
                    {m.sender === 'ai' && !m.streaming && !m.isError && (
                      <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.text, m.id)}
                            className="flex items-center gap-1 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                          >
                            {copiedMsgId === m.id ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleRegenerate}
                            disabled={isStreaming}
                            className="flex items-center gap-1 hover:text-cyan-300 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span className="text-[10px]">Regenerate</span>
                          </button>
                        </div>
                        {m.timestamp && <span className="text-[10px] text-slate-500">{m.timestamp}</span>}
                      </div>
                    )}

                  </div>

                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Stop Generating Floating Action Button */}
          {isStreaming && (
            <div className="flex justify-center -mb-2 z-10">
              <button
                type="button"
                onClick={handleStopGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-red-500/50 text-red-300 hover:bg-red-950/60 text-xs font-semibold shadow-lg transition active:scale-95"
              >
                <Square className="w-3 h-3 fill-red-400 text-red-400" />
                <span>Stop generating</span>
              </button>
            </div>
          )}

          {/* Message Input Area (ChatGPT Style Box) */}
          <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-cyan-500/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative rounded-2xl bg-slate-900/90 border border-cyan-500/40 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50 shadow-lg transition"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Message Intelligent Assistant (Supports coding, math, Tamil, road safety...)"
                className="w-full bg-transparent px-3.5 py-3 pr-14 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[44px]"
              />

              {/* Send / Stop Button inside Input Box */}
              <div className="absolute right-2.5 bottom-2 flex items-center">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    className="p-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md transition"
                    title="Stop Generating"
                  >
                    <Square className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white shadow-md shadow-cyan-600/30 transition active:scale-95"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Shift + Enter for new line. Powered by Ollama Local & xAI Grok.</span>
              <span className="text-cyan-400 font-mono">
                {selectedModel === 'auto' ? 'Auto Engine' : selectedModel}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

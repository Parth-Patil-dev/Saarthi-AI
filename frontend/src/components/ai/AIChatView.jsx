import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Send, Trash2, MessageSquare, BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';

const BASE_URL   = 'http://localhost:3000';
const STUDENT_ID = 'default';

// ── Streaming fetch helper ────────────────────────────────────────────────────
async function streamChat({ message, sessionId, onToken, onDone, onError }) {
  try {
    const res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (line.startsWith('event: token')) continue;
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          try {
            const json = JSON.parse(raw);
            // Route by event context — peek at previous line handled via buffer
            if (json.token  !== undefined) onToken(json.token);
            if (json.reply  !== undefined) onDone(json);
            if (json.message !== undefined) throw new Error(json.message);
          } catch (e) {
            if (e.message !== 'JSON parse') {} // skip parse errors
          }
        }
      }
    }
  } catch (err) {
    onError(err);
  }
}

// Better SSE parser
async function streamChatSSE({ message, sessionId, onToken, onDone, onError }) {
  try {
    const res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';
    let   lastEvt = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      const parts = buf.split('\n\n');
      buf = parts.pop();

      for (const block of parts) {
        const lines = block.split('\n');
        let evt  = lastEvt;
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) evt  = line.slice(7).trim();
          if (line.startsWith('data: '))  data = line.slice(6).trim();
        }
        lastEvt = evt;
        if (!data) continue;
        try {
          const json = JSON.parse(data);
          if (evt === 'token') onToken(json.token || '');
          if (evt === 'done')  onDone(json);
          if (evt === 'error') throw new Error(json.message);
        } catch (e) { /* skip */ }
      }
    }
  } catch (err) {
    onError(err);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AIChatView = ({ profile, conversations, onUpdateConversations }) => {
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [input,        setInput]        = useState('');
  const [isStreaming,  setIsStreaming]   = useState(false);
  const [streamingMsg, setStreamingMsg] = useState(''); // live token buffer
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, streamingMsg]);

  const systemPrompt = `You are Saarthi AI, a helpful and friendly tutor for students in rural India. 
The student is in Grade ${profile.grade} with a ${profile.aptitude} aptitude level. 
Always use simple language, relatable examples from rural life, and be encouraging.`;

  const handleSend = async () => {
    if (!input.trim() || !activeConv || isStreaming) return;

    const userMsg = {
      id: Date.now().toString(), role: 'user',
      content: input.trim(), timestamp: Date.now(),
    };

    // Optimistically add user message
    const withUser = { ...activeConv, messages: [...activeConv.messages, userMsg] };
    onUpdateConversations(conversations.map(c => c.id === activeConv.id ? withUser : c));
    setInput('');
    setIsStreaming(true);
    setStreamingMsg('');

    await streamChatSSE({
      message:   userMsg.content,
      sessionId: activeConvId,

      onToken: (token) => {
        setStreamingMsg(prev => prev + token);
      },

      onDone: (result) => {
        const aiMsg = {
          id: (Date.now() + 1).toString(), role: 'assistant',
          content: result.reply, timestamp: Date.now(),
        };
        const finalConv = { ...withUser, messages: [...withUser.messages, aiMsg] };
        onUpdateConversations(conversations.map(c => c.id === activeConv.id ? finalConv : c));
        setStreamingMsg('');
        setIsStreaming(false);
      },

      onError: (err) => {
        const errMsg = {
          id: (Date.now() + 1).toString(), role: 'assistant',
          content: `Error: ${err.message}`, timestamp: Date.now(),
        };
        const errConv = { ...withUser, messages: [...withUser.messages, errMsg] };
        onUpdateConversations(conversations.map(c => c.id === activeConv.id ? errConv : c));
        setStreamingMsg('');
        setIsStreaming(false);
      },
    });
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: `New Chat ${conversations.length + 1}`,
      messages: [{ id: '1', role: 'assistant', content: `Hello ${profile.name}! I'm your Saarthi AI tutor. What would you like to learn today?`, timestamp: Date.now() }],
      timestamp: Date.now(),
    };
    onUpdateConversations([newConv, ...conversations]);
    setActiveConvId(newId);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const newConvs = conversations.filter(c => c.id !== id);
    onUpdateConversations(newConvs);
    if (activeConvId === id) setActiveConvId(newConvs[0]?.id || null);
  };

  return (
    <div className="flex h-full bg-gray-50 p-6 gap-6">
      {/* Sessions Sidebar */}
      <div className="w-72 flex flex-col gap-4 shrink-0">
        <div className="card-notebook p-4 flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg">Sessions</h3>
          </div>
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Plus size={18} /> New Chat
          </button>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group relative p-3 border-2 cursor-pointer transition-all ${
                  activeConvId === conv.id
                    ? 'bg-yellow-100 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white border-transparent hover:border-black'
                }`}
              >
                <div className="font-bold text-sm truncate pr-6">{conv.title}</div>
                <div className="text-[10px] text-gray-500">{conv.messages.length} messages</div>
                <button
                  onClick={(e) => deleteChat(conv.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="card-notebook flex-1 flex flex-col overflow-hidden relative">
          {/* Notebook lines */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-12 border-r-2 border-red-200 h-full" />
            <div className="flex-1 h-full" style={{
              backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
              backgroundSize: '100% 2rem', marginTop: '2rem',
            }} />
          </div>

          {/* Header */}
          <div className="relative z-10 p-4 border-b-2 border-black bg-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-blue-600" size={24} />
              <div>
                <h2 className="font-bold text-xl handwritten">Saarthi AI Tutor</h2>
                <p className="text-xs text-gray-500">
                  {isStreaming ? (
                    <span className="text-blue-600 font-bold animate-pulse">● Thinking...</span>
                  ) : 'Ask me anything'}
                </p>
              </div>
            </div>
            <button
              onClick={() => activeConvId && deleteChat(activeConvId, { stopPropagation: () => {} })}
              className="p-2 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-6">
            {activeConv?.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  msg.role === 'user' ? 'bg-blue-50' : 'bg-white'
                }`}>
                  <p className="handwritten text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="text-[10px] text-gray-400 mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Live streaming message */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {streamingMsg ? (
                    <p className="handwritten text-lg leading-relaxed whitespace-pre-wrap">
                      {streamingMsg}
                      <span className="inline-block w-0.5 h-5 bg-black ml-0.5 animate-pulse align-middle" />
                    </p>
                  ) : (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative z-10 p-6 bg-white border-t-2 border-black">
            <div className="flex gap-4 items-end max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Type your question here..."
                className="flex-1 p-4 border-2 border-black focus:outline-none resize-none min-h-[60px] max-h-[200px] handwritten text-lg"
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-4 bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
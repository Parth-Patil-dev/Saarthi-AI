import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Plus, ArrowRight, BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';

const BASE_URL = 'http://localhost:3000';

// ── SSE streaming helper (shared logic) ───────────────────────────────────────
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
        let evt = lastEvt, data = '';
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
        } catch { /* skip */ }
      }
    }
  } catch (err) {
    onError(err);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AIAssistantSplit = ({ isOpen, onClose, profile, conversations, onUpdateConversations }) => {
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [input,        setInput]        = useState('');
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  const [isStreaming,  setIsStreaming]   = useState(false);
  const [streamingMsg, setStreamingMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, streamingMsg]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = async () => {
    if (!input.trim() || !activeConv || isStreaming) return;

    const userMsg = {
      id: Date.now().toString(), role: 'user',
      content: input.trim(), timestamp: Date.now(),
    };

    const withUser = { ...activeConv, messages: [...activeConv.messages, userMsg] };
    onUpdateConversations(conversations.map(c => c.id === activeConv.id ? withUser : c));
    setInput('');
    setIsStreaming(true);
    setStreamingMsg('');

    await streamChatSSE({
      message:   userMsg.content,
      sessionId: activeConvId,

      onToken: (token) => setStreamingMsg(prev => prev + token),

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
      title: `Chat ${conversations.length + 1}`,
      messages: [{ id: '1', role: 'assistant', content: `Hello ${profile.name}! How can I help you today?`, timestamp: Date.now() }],
      timestamp: Date.now(),
    };
    onUpdateConversations([newConv, ...conversations]);
    setActiveConvId(newId);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width:   isOpen ? (isMobile ? '100%' : 450) : 0,
        opacity: isOpen ? 1 : 0,
        x:       isOpen ? 0 : 20,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`border-black bg-white flex flex-col overflow-hidden shrink-0 z-40 ${
        isOpen ? 'border-l-2 relative' : 'border-l-0 absolute right-0 pointer-events-none'
      }`}
      style={{ height: '100%' }}
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-black flex justify-between items-center bg-blue-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-blue-600" />
          <h3 className="font-bold handwritten text-xl">AI Tutor</h3>
          {isStreaming && (
            <span className="text-[10px] text-blue-600 font-bold animate-pulse">● thinking</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={createNewChat} className="p-1 hover:bg-blue-100 transition-colors" title="New Chat">
            <Plus size={20} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-blue-100 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Session icons sidebar */}
        <div className="w-20 border-r-2 border-black bg-gray-50 flex flex-col items-center py-4 gap-4 overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-12 h-12 border-2 flex items-center justify-center transition-all ${
                activeConvId === conv.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-gray-200 hover:border-black'
              }`}
              title={conv.title}
            >
              <MessageSquare size={20} />
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConv?.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  msg.role === 'user' ? 'bg-blue-100' : 'bg-white'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Live streaming bubble */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {streamingMsg ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {streamingMsg}
                      <span className="inline-block w-0.5 h-4 bg-black ml-0.5 animate-pulse align-middle" />
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
          <div className="p-4 border-t-2 border-black">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                disabled={isStreaming}
                className="flex-1 p-2 border-2 border-black focus:outline-none text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
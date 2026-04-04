import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Trash2, 
  MessageSquare,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateAIResponse } from '../../services/geminiService';

export const AIChatView = ({ profile, conversations, onUpdateConversations }) => {
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const updatedConv = { ...activeConv, messages: [...activeConv.messages, userMsg] };
    const newConvs = conversations.map(c => c.id === activeConv.id ? updatedConv : c);
    onUpdateConversations(newConvs);
    setInput('');
    setIsTyping(true);

    const systemInstruction = `You are Saarthi AI, a helpful and friendly tutor for students in rural India. 
    The student is in Grade ${profile.grade} with a ${profile.aptitude} aptitude level. 
    Always use simple language, relatable examples from rural life (farming, village markets, local festivals), and be encouraging. 
    If the student asks about a specific subject, provide clear explanations and connect them to real-world scenarios they might see in their village.`;

    const response = await generateAIResponse(input, systemInstruction, activeConv);
    
    const aiMsg = { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      content: response.reply, 
      timestamp: Date.now() 
    };
    
    const finalConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg] };
    onUpdateConversations(conversations.map(c => c.id === activeConv.id ? finalConv : c));
    setIsTyping(false);
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: `New Chat ${conversations.length + 1}`,
      messages: [{ id: '1', role: 'assistant', content: `Hello ${profile.name}! I'm your Saarthi AI tutor. What would you like to learn today?`, timestamp: Date.now() }],
      timestamp: Date.now()
    };
    onUpdateConversations([newConv, ...conversations]);
    setActiveConvId(newId);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    const newConvs = conversations.filter(c => c.id !== id);
    onUpdateConversations(newConvs);
    if (activeConvId === id) {
      setActiveConvId(newConvs[0]?.id || null);
    }
    // const res = await fetch("http://localhost:3000/api/chat")
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
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all rounded-lg font-bold text-sm"
          >
            <Plus size={18} /> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group relative p-3 border-2 cursor-pointer transition-all rounded-lg ${
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="card-notebook flex-1 flex flex-col overflow-hidden relative">
          {/* Notebook Background */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-12 border-r-2 border-red-200 h-full"></div>
            <div className="flex-1 h-full" style={{ 
              backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', 
              backgroundSize: '100% 2rem',
              marginTop: '2rem'
            }}></div>
          </div>

          {/* Header */}
          <div className="relative z-10 p-4 border-b-2 border-black bg-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-blue-600" size={24} />
              <div>
                <h2 className="font-bold text-xl handwritten">Saarthi AI Tutor</h2>
                <p className="text-xs text-gray-500">Ask me anything or discuss your notes</p>
              </div>
            </div>
            <button 
              onClick={() => activeConvId && deleteChat(activeConvId, { stopPropagation: () => {} })}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
              title="Clear Conversation"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-6">
            {activeConv?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <MessageSquare size={48} />
                <p className="font-bold handwritten text-xl">Start a conversation with your Saarthi AI Tutor</p>
              </div>
            ) : (
              activeConv?.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 border-2 border-black ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}>
                    <p className="handwritten text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-[10px] text-gray-400 mt-2 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative z-10 p-6 bg-white border-t-2 border-black">
            <div className="flex gap-4 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your question here..."
                  className="w-full p-4 border-2 border-black focus:outline-none focus:ring-0 resize-none min-h-[60px] max-h-[200px] handwritten text-lg"
                  rows={1}
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
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

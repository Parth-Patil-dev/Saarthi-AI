import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Plus, 
  ArrowRight, 
  BrainCircuit 
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateAIResponse } from '../../services/geminiService';

export const AIAssistantSplit = ({ isOpen, onClose, profile, conversations, onUpdateConversations }) => {
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const updatedConv = { ...activeConv, messages: [...activeConv.messages, userMsg] };
    const newConvs = conversations.map(c => c.id === activeConv.id ? updatedConv : c);
    onUpdateConversations(newConvs);
    setInput('');

    // Real AI response
    const systemInstruction = `You are Saarthi AI, a helpful and friendly tutor for students in rural India. 
    The student is in Grade ${profile.grade} with a ${profile.aptitude} aptitude level. 
    Always use simple language, relatable examples from rural life (farming, village markets, local festivals), and be encouraging. 
    If the student asks about a specific subject, provide clear explanations and connect them to real-world scenarios they might see in their village.`;

    const response = await generateAIResponse(input, systemInstruction);
    
    const aiMsg = { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      content: response, 
      timestamp: Date.now() 
    };
    
    const finalConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg] };
    onUpdateConversations(conversations.map(c => c.id === activeConv.id ? finalConv : c));
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: `Chat ${conversations.length + 1}`,
      messages: [{ id: '1', role: 'assistant', content: `Hello ${profile.name}! How can I help you today?`, timestamp: Date.now() }],
      timestamp: Date.now()
    };
    onUpdateConversations([newConv, ...conversations]);
    setActiveConvId(newId);
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? (isMobile ? '100%' : 450) : 0,
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : 20
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`border-black bg-white flex flex-col overflow-hidden shrink-0 z-40 ${isOpen ? 'border-l-2 relative' : 'border-l-0 absolute right-0 pointer-events-none'}`}
      style={{ height: '100%' }}
    >
      <div className="p-4 border-b-2 border-black flex justify-between items-center bg-blue-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-blue-600" />
          <h3 className="font-bold handwritten text-xl">AI Tutor</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={createNewChat} className="p-1 hover:bg-blue-100 rounded-full transition-colors" title="New Chat">
            <Plus size={20} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        <div className="w-20 border-r-2 border-black bg-gray-50 flex flex-col items-center py-4 gap-4 overflow-y-auto">
          {conversations.map(conv => (
            <button 
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                activeConvId === conv.id ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-black'
              }`}
              title={conv.title}
            >
              <MessageSquare size={20} />
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConv?.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 border-2 border-black ${
                  msg.role === 'user' ? 'bg-blue-100' : 'bg-white'
                } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t-2 border-black">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 p-2 border-2 border-black focus:outline-none text-sm"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
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

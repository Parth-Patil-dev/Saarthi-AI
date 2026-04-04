import React, { useState } from 'react';
import { 
  ArrowRight, 
  HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { APTITUDE_QUESTIONS } from '../../constants';

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(10);
  const [aptitudeScore, setAptitudeScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const nextStep = () => setStep(s => s + 1);

  const handleAptitudeAnswer = (answer) => {
    let newScore = aptitudeScore;
    if (answer === APTITUDE_QUESTIONS[currentQuestion].correct) {
      newScore = aptitudeScore + 1;
      setAptitudeScore(newScore);
    }
    
    if (currentQuestion < APTITUDE_QUESTIONS.length - 1) {
      setCurrentQuestion(q => q + 1);
    } else {
      const level = newScore >= 2 ? 'advanced' : newScore === 1 ? 'intermediate' : 'beginner';
      onComplete({ name, grade: Number(grade), aptitude: level, onboarded: true, joinedAt: Date.now() });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="fixed top-6 right-6">
        <button 
          onClick={() => alert("Saarthi AI is here to help! Just fill in your name and grade to get started. We'll then do a quick test to see how I can best teach you.")}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-bold hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <HelpCircle size={20} />
          <span>Need Help?</span>
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-notebook w-full max-w-md p-8"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold handwritten mb-2">Namaste!</h1>
              <p className="text-gray-600">Let's start your learning journey.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">What's your name?</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Which grade are you in?</label>
                <select 
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value))}
                  className="w-full p-2 border-2 border-black focus:outline-none"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <button 
                disabled={!name}
                onClick={nextStep}
                className="w-full btn-notebook flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold handwritten mb-2">Quick Aptitude Test</h2>
              <p className="text-gray-600">This helps AI understand how to teach you best.</p>
            </div>
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="font-medium mb-4">{APTITUDE_QUESTIONS[currentQuestion].question}</p>
              <div className="grid grid-cols-1 gap-2">
                {APTITUDE_QUESTIONS[currentQuestion].options.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAptitudeAnswer(opt)}
                    className="p-2 text-left border-2 border-black bg-white hover:bg-blue-100 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              Question {currentQuestion + 1} of {APTITUDE_QUESTIONS.length}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

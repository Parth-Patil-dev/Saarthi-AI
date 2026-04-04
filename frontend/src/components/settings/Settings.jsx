import React from 'react';
import { 
  User, 
  BrainCircuit 
} from 'lucide-react';

export const Settings = ({ profile, onReset }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold handwritten mb-8">Settings</h1>
      <div className="card-notebook space-y-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><User size={20} /> Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
              <p className="font-bold">{profile.name}</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Grade</label>
              <p className="font-bold">{profile.grade}</p>
            </div>
          </div>
        </section>
        <div className="h-[2px] bg-gray-100"></div>
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><BrainCircuit size={20} /> AI Preferences</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Adaptive Tutoring</p>
                <p className="text-xs text-gray-500">Currently set to {profile.aptitude} mode</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full p-1 flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
        <button 
          onClick={onReset}
          className="w-full py-2 text-red-600 font-bold border-2 border-red-600 hover:bg-red-50 transition-colors"
        >
          Reset Account
        </button>
      </div>
    </div>
  );
};

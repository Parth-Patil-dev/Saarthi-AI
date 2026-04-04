import React from 'react';
import { SUBJECTS } from '../../constants';

export const SubjectsView = ({ onSelectChapter }) => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold handwritten mb-8">Your Textbooks</h1>
      <div className="grid grid-cols-1 gap-12">
        {SUBJECTS.map(subject => (
          <div key={subject.id} className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg text-2xl">
                {subject.icon}
              </div>
              <h2 className="text-3xl font-bold">{subject.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subject.chapters.map(chapter => (
                <div 
                  key={chapter.id}
                  onClick={() => onSelectChapter(subject, chapter)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-all p-6 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#e91e63] text-white flex items-center justify-center font-bold text-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}>
                      <span className="absolute top-2 right-2">{chapter.id}</span>
                    </div>
                    
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{subject.name} Part 1</div>
                      <h4 className="text-xl font-bold leading-tight group-hover:text-[#e91e63] transition-colors">{chapter.title}</h4>
                    </div>

                    <div className="space-y-2">
                      <div className="h-1 w-12 bg-black"></div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Standard X • 2024-25</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

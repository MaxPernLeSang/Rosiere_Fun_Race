import React from 'react';
import { formatTime } from '../utils';

interface StopwatchProps {
  elapsed: number;
  isRunning: boolean;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ elapsed, isRunning }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl w-full max-w-2xl mx-auto mb-8 relative overflow-hidden group">
      
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 bg-blue-500 opacity-5 blur-2xl transition-opacity duration-500 ${isRunning ? 'opacity-10' : 'opacity-0'}`}></div>

      <span className="text-sm font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 z-10">Temps de Course</span>
      
      <div className="font-mono text-6xl md:text-8xl font-bold text-white tracking-widest z-10 tabular-nums">
        {formatTime(elapsed)}
      </div>
      
      <div className="mt-4 flex items-center space-x-2 z-10">
        <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-xs text-slate-500 font-medium">
          {isRunning ? 'EN COURS - SYNC SYSTÈME' : 'ARRÊTÉ'}
        </span>
      </div>
    </div>
  );
};
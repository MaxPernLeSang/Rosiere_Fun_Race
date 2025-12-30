import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatAbsoluteTime } from '../utils';

export const AtomicClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = requestAnimationFrame(function update() {
      setTime(new Date());
      requestAnimationFrame(update);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-md">
      <Clock className="w-5 h-5 text-blue-400" />
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Horloge de Référence</span>
        <span className="text-xl font-mono font-bold text-blue-100 tracking-wider">
          {formatAbsoluteTime(time)}
        </span>
      </div>
    </div>
  );
};
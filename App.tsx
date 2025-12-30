import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Copy, Sheet, Flag, Timer } from 'lucide-react';
import { RaceRecord, TimerState } from './types.ts';
import { generateId, formatTime, formatAbsoluteTime } from './utils.ts';
import { AtomicClock } from './components/AtomicClock.tsx';
import { Stopwatch } from './components/Stopwatch.tsx';
import { ResultsTable } from './components/ResultsTable.tsx';

const App: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<RaceRecord[]>([]);
  const requestRef = useRef<number | null>(null);
  
  // Update the timer loop
  const animate = useCallback(() => {
    if (startTime && timerState === TimerState.RUNNING) {
      setElapsed(Date.now() - startTime);
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [startTime, timerState]);

  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [timerState, animate]);

  // Controls
  const handleStart = () => {
    if (timerState === TimerState.IDLE) {
      const now = Date.now();
      setStartTime(now);
      setTimerState(TimerState.RUNNING);
    } else if (timerState === TimerState.STOPPED) {
      // Resume logic
      const now = Date.now();
      setStartTime(now - elapsed);
      setTimerState(TimerState.RUNNING);
    }
  };

  const handleStop = () => {
    setTimerState(TimerState.STOPPED);
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser tout le chronomètre et effacer les résultats ?')) {
      setTimerState(TimerState.IDLE);
      setStartTime(null);
      setElapsed(0);
      setRecords([]);
    }
  };

  const addRecord = useCallback((initialBib: string = '') => {
    if (timerState !== TimerState.RUNNING || !startTime) return;

    const now = Date.now();
    const currentElapsed = now - startTime;

    const newRecord: RaceRecord = {
      id: generateId(),
      timestamp: now,
      elapsed: currentElapsed,
      bibNumber: initialBib,
    };

    setRecords(prev => [...prev, newRecord]);
  }, [timerState, startTime]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.code === 'NumpadEnter' || e.code === 'Enter') {
        e.preventDefault();
        addRecord();
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        addRecord(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addRecord]);

  const updateBib = (id: string, bib: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, bibNumber: bib } : r));
  };

  const deleteRecord = (id: string) => {
    if(confirm("Supprimer ce temps ?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Export Logic
  const getExportData = (separator: string) => {
    const header = [
      'Position', 
      'Dossard', 
      'Temps Chrono (Enregistré)', 
      'Heure Départ (Atomique)', 
      'Heure Arrivée (Atomique)'
    ];
    
    const rows = records.map((r, i) => {
      const calculatedStartTime = new Date(r.timestamp - r.elapsed);
      return [
        i + 1,
        r.bibNumber || 'Inconnu',
        formatTime(r.elapsed),
        formatAbsoluteTime(calculatedStartTime),
        formatAbsoluteTime(new Date(r.timestamp))
      ];
    });
    return [header, ...rows].map(row => row.join(separator)).join('\n');
  };

  const handleGoogleSheetsExport = async () => {
    const data = getExportData('\t');
    try {
      await navigator.clipboard.writeText(data);
      const shouldOpen = confirm(
        "✅ Données copiées !\n\n" +
        "Voulez-vous ouvrir une nouvelle feuille Google Sheets maintenant pour les coller (Ctrl+V) ?"
      );
      
      if (shouldOpen) {
        window.open('https://sheet.new', '_blank');
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de copier les données. Veuillez utiliser l'export CSV.");
    }
  };

  const downloadCSV = () => {
    const data = getExportData(';');
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rosiere_race_resultats_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Timer className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Rosiere <span className="text-indigo-400">Fun Race</span></h1>
        </div>
        <AtomicClock />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col">
        
        {/* Timer Display */}
        <Stopwatch elapsed={elapsed} isRunning={timerState === TimerState.RUNNING} />

        {/* Control Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {timerState === TimerState.IDLE || timerState === TimerState.STOPPED ? (
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/20 transition-all active:scale-95"
            >
              <Play size={24} fill="currentColor" />
              {timerState === TimerState.STOPPED ? 'REPRENDRE' : 'DÉPART'}
            </button>
          ) : (
            <>
              <button 
                onClick={() => addRecord()}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95"
              >
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-sm text-slate-400">ESPACE</span>
                TOP ARRIVÉE
              </button>
              
              <button 
                onClick={handleStop}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95"
              >
                <Pause size={24} fill="currentColor" />
                STOP
              </button>
            </>
          )}

          <button 
            onClick={handleReset}
            disabled={timerState === TimerState.IDLE}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold shadow-md transition-all"
          >
            <RotateCcw size={20} />
            RESET
          </button>
        </div>

        {/* Results Section */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
              Résultats en direct
              <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{records.length} coureurs</span>
            </h2>
            
            <div className="flex gap-2">
              <button 
                onClick={handleGoogleSheetsExport}
                disabled={records.length === 0}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-600/30 shadow-sm"
                title="Copier et ouvrir Sheets"
              >
                <Sheet size={16} />
                <span className="hidden sm:inline">Créer Google Sheet</span>
              </button>
              <button 
                onClick={downloadCSV}
                disabled={records.length === 0}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>

          <ResultsTable 
            records={records} 
            onUpdateBib={updateBib} 
            onDeleteRecord={deleteRecord}
            startTime={startTime}
          />
        </div>
      </main>
      
      {/* Footer Instructions */}
      <footer className="bg-slate-950 py-3 text-center text-xs text-slate-500">
        Utilisez la barre <span className="text-slate-300 font-bold">ESPACE</span> ou les touches numériques pour enregistrer un temps.
        Appuyez sur <span className="text-slate-300 font-bold">ENTRÉE</span> pour valider un numéro de dossard.
      </footer>
    </div>
  );
};

export default App;
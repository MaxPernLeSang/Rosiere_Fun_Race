import React, { useRef, useEffect } from 'react';
import { RaceRecord } from '../types.ts';
import { formatTime, formatAbsoluteTime } from '../utils.ts';
import { Trash2 } from 'lucide-react';

interface ResultsTableProps {
  records: RaceRecord[];
  onUpdateBib: (id: string, bib: string) => void;
  onDeleteRecord: (id: string) => void;
  startTime: number | null;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ records, onUpdateBib, onDeleteRecord, startTime }) => {
  const endOfTableRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when a new record is added
  useEffect(() => {
    if (endOfTableRef.current) {
      endOfTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // Auto focus the input of the last record if it was just added
    if (records.length > 0) {
      const lastRecordId = records[records.length - 1].id;
      const element = document.getElementById(`bib-input-${lastRecordId}`);
      if (element) {
        element.focus();
      }
    }
  }, [records.length]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
        <p>En attente de coureurs...</p>
        <p className="text-sm mt-2">Appuyez sur <kbd className="bg-slate-700 px-2 py-1 rounded text-white font-mono">ESPACE</kbd> ou les touches numériques pour enregistrer un temps.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 sticky top-0 z-10 text-xs uppercase text-slate-400 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-3 border-b border-slate-700">#</th>
              <th className="px-6 py-3 border-b border-slate-700">Dossard (Numéro)</th>
              <th className="px-6 py-3 border-b border-slate-700 text-right">Temps (Chrono)</th>
              <th className="px-6 py-3 border-b border-slate-700 text-right text-slate-500 hidden md:table-cell">Heure Arrivée</th>
              <th className="px-4 py-3 border-b border-slate-700 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {records.map((record, index) => (
              <tr key={record.id} className="hover:bg-slate-750 transition-colors group">
                <td className="px-6 py-3 font-mono text-slate-500 w-12 text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-2">
                  <input
                    id={`bib-input-${record.id}`}
                    type="text"
                    inputMode="numeric"
                    value={record.bibNumber}
                    onChange={(e) => onUpdateBib(record.id, e.target.value)}
                    placeholder="Entrer N°"
                    className="bg-slate-900 border border-slate-600 text-white text-lg font-bold rounded px-3 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-600 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                      e.stopPropagation(); // Prevent global listeners from catching this
                    }}
                  />
                </td>
                <td className="px-6 py-3 text-right font-mono text-xl text-yellow-400 font-bold">
                  {formatTime(record.elapsed)}
                </td>
                <td className="px-6 py-3 text-right font-mono text-sm text-slate-500 hidden md:table-cell">
                  {formatAbsoluteTime(new Date(record.timestamp))}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                    title="Supprimer la ligne"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            <div ref={endOfTableRef} />
          </tbody>
        </table>
      </div>
    </div>
  );
};
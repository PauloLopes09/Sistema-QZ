import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Tender } from '../types';

interface DashboardProps {
  tenders: Tender[];
  onEdit: (tender: Tender) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenders, onEdit, currentDate, setCurrentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Data de hoje para cálculo do "Fantasma" (Passado vs Futuro)
  const todayObj = new Date();
  const localToday = todayObj.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD

  const hasValues = (t: Tender) => {
    if (t.tipoLicitacao === 'Valor') {
      return t.valorMinimo && t.valorMinimo > 0;
    } else {
      return t.percentualDesconto && t.percentualDesconto > 0;
    }
  };

  const getTenderStatus = (t: Tender) => hasValues(t) ? 'ok' : 'pending';

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      aberturas: tenders.filter(t => t.dataAbertura === dateStr),
      retornos: tenders.filter(t => t.dataRetorno === dateStr)
    };
  };

  const isCurrentMonth = todayObj.getMonth() === month && todayObj.getFullYear() === year;
  const currentDay = todayObj.getDate();

  return (
    <div className="bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="font-black text-zinc-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-violet-600" /> 
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white rounded-xl border border-zinc-200 transition-all"><ChevronLeft className="w-5 h-5 text-zinc-600" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-[10px] font-black uppercase text-violet-600 hover:bg-violet-50 rounded-lg">Hoje</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white rounded-xl border border-zinc-200 transition-all"><ChevronRight className="w-5 h-5 text-zinc-600" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/30 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="p-4 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 border-r border-b border-zinc-50 bg-zinc-50/10" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { aberturas, retornos } = getEventsForDay(day);
          const isToday = isCurrentMonth && day === currentDay;

          return (
            <div key={day} className={`p-2 min-h-32 border-r border-b border-zinc-100 hover:bg-zinc-50/80 transition-all ${isToday ? 'bg-violet-50/30' : ''}`}>
              <span className={`text-xs font-black ${isToday ? 'text-violet-600 bg-violet-100 rounded-full px-2 py-0.5 shadow-sm' : 'text-zinc-400'}`}>
                {day}
              </span>
              <div className="mt-2 space-y-1">
                {aberturas.map((t, idx) => {
                  const status = getTenderStatus(t);
                  // Verifica se é passado para aplicar transparência (Histórico Fantasma)
                  const isPast = t.dataAbertura < localToday;

                  return (
                    <div 
                      key={`ab-${idx}`} 
                      onClick={() => onEdit(t)}
                      className={`
                        cursor-pointer p-1.5 rounded-xl border shadow-sm transition-all hover:scale-105 
                        ${isPast ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}
                        ${status === 'ok' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
                      `}
                    >
                      {/* Remove alerta de urgência se for passado */}
                      {!hasValues(t) && !isPast && (
                        <div className="bg-rose-600 text-[7px] text-white font-black uppercase text-center py-0.5 rounded-md mb-1 animate-pulse">
                          URGÊNCIA
                        </div>
                      )}
                      <p className="text-[9px] font-black truncate">{t.orgaoLicitante || 'Órgão'}</p>
                      <p className="text-[7px] truncate opacity-60 leading-tight">{t.numeroEdital}</p>
                    </div>
                  );
                })}
                {retornos.map((t, idx) => {
                  // Fantasma para retornos também
                  const isPast = t.dataRetorno && t.dataRetorno < localToday;
                  return (
                    <div 
                      key={`ret-${idx}`} 
                      onClick={() => onEdit(t)} 
                      className={`
                        cursor-pointer flex flex-col p-1.5 bg-amber-500 text-white rounded-xl shadow-sm hover:scale-105 transition-all
                        ${isPast ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}
                      `}
                    >
                      <p className="text-[9px] font-black truncate">{t.orgaoLicitante}</p>
                      <p className="text-[7px] font-bold uppercase opacity-80 mt-0.5 truncate">{(t as any).retornoQualquerMomento ? 'Qqr. Momento' : t.horarioRetorno}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

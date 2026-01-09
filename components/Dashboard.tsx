import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Gavel,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Tender } from '../types';

interface DashboardProps {
  tenders: Tender[];
  onEdit: (tender: Tender) => void;
  currentDate: Date;           // Recebido do pai
  setCurrentDate: (d: Date) => void; // Recebido do pai
}

export const Dashboard: React.FC<DashboardProps> = ({ tenders, onEdit, currentDate, setCurrentDate }) => {
  // Pega a data de hoje em formato string YYYY-MM-DD para comparação segura
  const today = new Date();
  const localToday = today.toLocaleDateString('en-CA'); // Retorna "2023-10-25" (exemplo)

  // Verifica se existem valores financeiros
  const hasValues = (t: Tender) => {
    if (t.tipoLicitacao === 'Valor') {
      return t.valorMinimo && t.valorMinimo > 0;
    } else {
      return t.percentualDesconto && t.percentualDesconto > 0;
    }
  };

  // Status OK se tiver valores
  const getTenderStatus = (t: Tender) => hasValues(t) ? 'ok' : 'pending';

  // Filtra licitações cuja data de abertura é hoje ou futuro
  const upcomingTenders = tenders.filter(t => t.dataAbertura >= localToday);
  
  // Pendentes são as futuras que não tem valor
  const needsDiligence = upcomingTenders.filter(t => !hasValues(t));
  
  // Impugnações: Prazo futuro
  const impugnacoes = tenders.filter(t => {
    const dates = [t.prazoImpugnacao, t.prazoEsclarecimento].filter(Boolean);
    return dates.some(d => d! >= localToday);
  });

  const aptos = upcomingTenders.filter(t => getTenderStatus(t) === 'ok');

  const stats = [
    { label: 'Próximas Licitações', value: upcomingTenders.length, icon: CalendarIcon, color: 'bg-blue-600', sub: 'Aberturas futuras' },
    { label: 'Pendente de valores mínimos', value: needsDiligence.length, icon: DollarSign, color: 'bg-rose-600', sub: 'Pendente de Participação' },
    { label: 'Impugnações e Esclarecimentos', value: impugnacoes.length, icon: Gavel, color: 'bg-amber-500', sub: 'Prazos em aberto' },
    { label: 'Apto para Participação', value: aptos.length, icon: CheckCircle2, color: 'bg-emerald-600', sub: 'Participação confirmada' },
  ];

  // Lógica de Renderização do Calendário
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { aberturas: tenders.filter(t => t.dataAbertura === dateStr), retornos: tenders.filter(t => t.dataRetorno === dateStr) };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}><stat.icon className="w-6 h-6" /></div>
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-tight">{stat.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Apenas o Calendário Visual (A barra lateral foi para o App.tsx para ficar fixa) */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-blue-600" /> {monthNames[month]} {year}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg">Hoje</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30 font-black text-[10px] text-slate-400 uppercase tracking-widest">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="p-4 text-center">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="p-2 border-r border-b border-slate-50 bg-slate-50/10" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const { aberturas, retornos } = getEventsForDay(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === localToday;

            return (
              <div key={day} className={`p-2 min-h-32 border-r border-b border-slate-100 hover:bg-slate-50/80 transition-all ${isToday ? 'bg-blue-50/30' : ''}`}>
                <span className={`text-xs font-black ${isToday ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 shadow-sm' : 'text-slate-400'}`}>{day}</span>
                <div className="mt-2 space-y-1">
                  {aberturas.map((t, idx) => {
                    const status = getTenderStatus(t);
                    return (
                      <div key={`ab-${idx}`} onClick={() => onEdit(t)} className={`cursor-pointer p-1.5 rounded-xl border shadow-sm transition-transform hover:scale-105 ${status === 'ok' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                        {!hasValues(t) && <div className="bg-rose-600 text-[7px] text-white font-black uppercase text-center py-0.5 rounded-md mb-1 animate-pulse">URGÊNCIA</div>}
                        <p className="text-[9px] font-black truncate">{t.orgaoLicitante || 'Órgão'}</p>
                        <p className="text-[7px] truncate opacity-60 leading-tight">{t.numeroEdital}</p>
                      </div>
                    );
                  })}
                  {retornos.map((t, idx) => (
                    <div key={`ret-${idx}`} onClick={() => onEdit(t)} className="cursor-pointer flex flex-col p-1.5 bg-amber-500 text-white rounded-xl shadow-sm hover:scale-105 transition-all">
                      <p className="text-[9px] font-black truncate">{t.orgaoLicitante}</p>
                      <p className="text-[7px] font-bold uppercase opacity-80 mt-0.5 truncate">{t.retornoQualquerMomento ? 'Qqr. Momento' : t.horarioRetorno}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

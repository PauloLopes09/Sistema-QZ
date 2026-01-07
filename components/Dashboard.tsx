
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Gavel,
  Info,
  CheckCircle2,
  AlertOctagon,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Tender, TenderStatus } from '../types';

interface DashboardProps {
  tenders: Tender[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tenders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Updated status check considering proposal requirements
  const getTenderStatus = (t: Tender) => {
    const hasBasicInfo = t.empresa && t.orgaoLicitante && t.numeroEdital && t.objeto;
    const hasFinancials = t.valorReferencia > 0;
    const hasGarantiaIfRequired = !t.exigeGarantia || (t.exigeGarantia && t.valorGarantia && t.valorGarantia > 0);
    
    // Critical Requirement: Proposal must be sent and have values
    const proposalOk = t.propostaEnviada && (
      (t.tipoLicitacao === 'Valor' && t.valorMinimo && t.valorMinimo > 0) ||
      (t.tipoLicitacao === 'Desconto' && t.percentualDesconto && t.percentualDesconto > 0)
    );
    
    const isOk = hasBasicInfo && hasFinancials && hasGarantiaIfRequired && proposalOk;
    return isOk ? 'ok' : 'pending';
  };

  const upcomingTenders = tenders.filter(t => new Date(t.dataAbertura) >= now);
  const criticalPendencies = upcomingTenders.filter(t => getTenderStatus(t) === 'pending');
  const needsCharging = upcomingTenders.filter(t => !t.propostaEnviada);
  
  const stats = [
    { label: 'Próximas Licitações', value: upcomingTenders.length, icon: CalendarIcon, color: 'bg-blue-600', sub: 'Aberturas futuras' },
    { label: 'Cobrar Propostas', value: needsCharging.length, icon: AlertTriangle, color: 'bg-rose-600', sub: 'Pendentes de envio' },
    { 
      label: 'Prazos Legais', 
      value: tenders.filter(t => {
        const dates = [t.prazoImpugnacao, t.prazoEsclarecimento].filter(Boolean);
        return dates.some(d => new Date(d!) >= now && new Date(d!) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
      }).length, 
      icon: Gavel, 
      color: 'bg-amber-500', 
      sub: 'Próximos 7 dias' 
    },
    { 
      label: 'Processos OK', 
      value: upcomingTenders.filter(t => getTenderStatus(t) === 'ok').length, 
      icon: CheckCircle2, 
      color: 'bg-emerald-600', 
      sub: 'Documentação pronta' 
    },
  ];

  // Calendar Logic...
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      aberturas: tenders.filter(t => t.dataAbertura === dateStr),
      impugnacoes: tenders.filter(t => t.prazoImpugnacao === dateStr),
      esclarecimentos: tenders.filter(t => t.prazoEsclarecimento === dateStr)
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{stat.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Calendar */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg">Hoje</button>
              <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-4 border-r border-b border-slate-50 bg-slate-50/10" />
            ))}
            
            {Array.from({ length: daysCount }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(year, month, day);
              const isPast = dateObj < now;
              const isToday = dateObj.getTime() === now.getTime();
              
              const { aberturas, impugnacoes, esclarecimentos } = getEventsForDay(day);
              const hasEvents = aberturas.length > 0 || impugnacoes.length > 0 || esclarecimentos.length > 0;

              return (
                <div key={day} className={`p-2 min-h-32 border-r border-b border-slate-100 relative group transition-all hover:bg-slate-50/80 ${isToday ? 'bg-blue-50/30' : ''} ${isPast ? 'opacity-40' : ''}`}>
                  <span className={`text-xs font-black ${isToday ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-0.5' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  
                  <div className="mt-2 space-y-1.5 overflow-hidden">
                    {aberturas.map((t, idx) => {
                      const status = getTenderStatus(t);
                      return (
                        <div key={`ab-${idx}`} className={`flex flex-col p-1.5 rounded-lg border shadow-sm transition-transform group-hover:scale-[1.02] ${status === 'ok' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className={`text-[9px] font-black truncate ${status === 'ok' ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {t.numeroEdital}
                            </span>
                          </div>
                          {!t.propostaEnviada && (
                            <div className="bg-rose-600 text-[6px] text-white font-black uppercase text-center py-0.5 rounded-sm mb-1 animate-pulse">COBRAR</div>
                          )}
                          <div className="space-y-0.5">
                            <p className="text-[7px] font-bold text-slate-500 uppercase truncate leading-none">{t.empresa}</p>
                            <p className="text-[7px] font-medium text-slate-400 truncate leading-none">{t.orgaoLicitante}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full max-h-[850px] overflow-hidden">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Agenda Operacional
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {upcomingTenders.length === 0 ? (
                <p className="text-sm font-bold italic text-slate-400 text-center py-10">Sem tarefas futuras.</p>
              ) : (
                upcomingTenders.map((t, idx) => {
                  const status = getTenderStatus(t);
                  return (
                    <div key={idx} className="flex flex-col p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex gap-4 mb-3">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <span className="text-[10px] uppercase leading-none font-black">{new Date(t.dataAbertura).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-lg leading-none font-black">{new Date(t.dataAbertura).getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 truncate">{t.numeroEdital}</p>
                          <p className="text-[10px] text-slate-500 font-bold truncate uppercase">{t.empresa}</p>
                        </div>
                      </div>

                      {!t.propostaEnviada && (
                        <div className="mb-3 p-3 bg-rose-600 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-200">
                          <AlertTriangle className="w-5 h-5 text-white" />
                          <div>
                            <p className="text-[10px] font-black text-white uppercase leading-none">Atenção!</p>
                            <p className="text-[9px] font-bold text-rose-100 uppercase">Cobrar envio da proposta!</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200">
                         <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.horarioSessao}
                         </span>
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${status === 'ok' ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>
                            {status === 'ok' ? 'Documentos OK' : 'Pendente'}
                         </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

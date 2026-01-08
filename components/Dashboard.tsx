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
import { Tender, TenderStatus } from '../types';

interface DashboardProps {
  tenders: Tender[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tenders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Lógica de verificação de conformidade jurídica (Status Apto)
  const getTenderStatus = (t: Tender) => {
    const hasBasicInfo = t.empresa && t.orgaoLicitante && t.numeroEdital && t.objeto;
    const hasFinancials = t.valorReferencia > 0;
    const hasGarantiaIfRequired = !t.exigeGarantia || (t.exigeGarantia && t.valorGarantia && t.valorGarantia > 0);
    
    const proposalOk = t.propostaEnviada && (
      (t.tipoLicitacao === 'Valor' && t.valorMinimo && t.valorMinimo > 0) ||
      (t.tipoLicitacao === 'Desconto' && t.percentualDesconto && t.percentualDesconto > 0)
    );
    
    const isOk = hasBasicInfo && hasFinancials && hasGarantiaIfRequired && proposalOk;
    return isOk ? 'ok' : 'pending';
  };

  const upcomingTenders = tenders.filter(t => new Date(t.dataAbertura) >= now);
  const needsDiligence = upcomingTenders.filter(t => !t.propostaEnviada);
  
  // Definição dos Cards com as nomenclaturas atualizadas
  const stats = [
    { 
      label: 'Próximas Licitações', 
      value: upcomingTenders.length, 
      icon: CalendarIcon, 
      color: 'bg-blue-600', 
      sub: 'Aberturas futuras' 
    },
    { 
      label: 'Pendente de valores mínimos', 
      value: needsDiligence.length, 
      icon: DollarSign, 
      color: 'bg-rose-600', 
      sub: 'Pendente de Participação' 
    },
    { 
      label: 'Impugnações e Esclarecimentos', 
      value: tenders.filter(t => {
        const dates = [t.prazoImpugnacao, t.prazoEsclarecimento].filter(Boolean);
        return dates.some(d => new Date(d!) >= now && new Date(d!) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
      }).length, 
      icon: Gavel, 
      color: 'bg-amber-500', 
      sub: 'Prazos para Esclarecimentos' 
    },
    { 
      label: 'Apto para Participação', 
      value: upcomingTenders.filter(t => getTenderStatus(t) === 'ok').length, 
      icon: CheckCircle2, 
      color: 'bg-emerald-600', 
      sub: 'Habilitação Jurídica OK' 
    },
  ];

  // Lógica de Datas do Calendário
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      aberturas: tenders.filter(t => t.dataAbertura === dateStr),
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Grid de Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-tight">{stat.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendário Operacional Completo */}
        <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg">Hoje</button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30 font-black text-[10px] text-slate-400 uppercase tracking-widest">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="p-4 text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 border-r border-b border-slate-50 bg-slate-50/10" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { aberturas } = getEventsForDay(day);
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

              return (
                <div key={day} className={`p-2 min-h-32 border-r border-b border-slate-100 hover:bg-slate-50/80 transition-all ${isToday ? 'bg-blue-50/30' : ''}`}>
                  <span className={`text-xs font-black ${isToday ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 shadow-sm' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <div className="mt-2 space-y-1">
                    {aberturas.map((t, idx) => {
                      const status = getTenderStatus(t);
                      return (
                        <div key={idx} className={`p-1.5 rounded-xl border shadow-sm ${status === 'ok' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                          {!t.propostaEnviada && (
                            <div className="bg-rose-600 text-[7px] text-white font-black uppercase text-center py-0.5 rounded-md mb-1 animate-pulse">
                              DILIGÊNCIA
                            </div>
                          )}
                          <p className="text-[9px] font-black truncate">{t.numeroEdital}</p>
                          <p className="text-[7px] truncate opacity-60 leading-tight">{t.empresa}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda Operacional Lateral */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 h-full">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Agenda Operacional
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
              {upcomingTenders.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10 font-bold italic">Sem tarefas agendadas.</p>
              ) : (
                upcomingTenders.map((t, idx) => {
                  const status = getTenderStatus(t);
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex gap-4 mb-3">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm ${status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(t.dataAbertura).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-lg font-black text-slate-900">{new Date(t.dataAbertura).getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 truncate">{t.numeroEdital}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{t.empresa}</p>
                        </div>
                      </div>

                      {/* Alerta de Atenção Restaurado */}
                      {!t.propostaEnviada && (
                        <div className="mb-3 p-3 bg-rose-600 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-100">
                          <AlertTriangle className="w-5 h-5 text-white" />
                          <div>
                            <p className="text-[10px] font-black text-white uppercase leading-none">Diligência</p>
                            <p className="text-[9px] font-bold text-rose-50 uppercase mt-1">Solicitar valores mínimos</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.horarioSessao || '--:--'}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${status === 'ok' ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>
                          {status === 'ok' ? 'Habilitado' : 'Pendente'}
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

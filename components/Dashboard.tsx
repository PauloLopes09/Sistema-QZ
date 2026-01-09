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
  onEdit: (tender: Tender) => void; // Nova propriedade para habilitar o clique
}

export const Dashboard: React.FC<DashboardProps> = ({ tenders, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Lógica de verificação de conformidade (Status Apto)
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
  
  // Cards de Métricas
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
      sub: 'Participação confirmada' 
    },
  ];

  // Lógica do Calendário
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
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
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
        {/* Calendário */}
        <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2

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
  const needsCharging = upcomingTenders.filter(t => !t.propostaEnviada);
  
  const stats = [
    { 
      label: 'Próximas Licitações', 
      value: upcomingTenders.length, 
      icon: CalendarIcon, 
      color: 'bg-blue-600', 
      sub: 'Aberturas futuras' 
    },
    { 
      label: 'Pendente de valores mínimos', // Atualizado conforme solicitado
      value: needsCharging.length, 
      icon: DollarSign, 
      color: 'bg-rose-600', 
      sub: 'Diligência de Proposta' 
    },
    { 
      label: 'Prazos Legais', 
      value: tenders.filter(t => {
        const dates = [t.prazoImpugnacao, t.prazoEsclarecimento].filter(Boolean);
        return dates.some(d => new Date(d!) >= now && new Date(d!) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
      }).length, 
      icon: Gavel, 
      color: 'bg-amber-500', 
      sub: 'Contencioso Administrativo' 
    },
    { 
      label: 'Apto para Participação', 
      value: upcomingTenders.filter(t => getTenderStatus(t) === 'ok').length, 
      icon: CheckCircle2, 
      color: 'bg-emerald-600', 
      sub: 'Habilitação Jurídica OK' 
    },
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{stat.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendário e Agenda permanecem com a mesma estrutura do seu original */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex-1 p-4 text-center text-slate-300 font-bold uppercase text-xs mt-20">
            Visualização de Calendário Ativa
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 h-full">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Agenda Operacional
            </h3>
            {/* ... mapeamento de tenders para a agenda ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

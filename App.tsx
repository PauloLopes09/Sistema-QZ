import React, { useState, useEffect } from 'react';
import { 
  Home, FilePlus, Clipboard, BarChart2, Settings, 
  Search, Bell, Zap, X, Trash2, Plus, 
  Building, Clock, DollarSign, FileCheck, Save, ArrowLeft,
  LayoutDashboard, ListTodo, History, Info, CheckCircle,
  AlertTriangle, Percent, FileText, Gavel, Layers, CalendarClock, MessageSquare,
  Edit3, Filter, CheckCircle2, PlayCircle, Timer, Calendar, ChevronLeft, ChevronRight,
  Flag, Award, ArrowRightCircle, AlertCircle, Scale
} from 'lucide-react';
import { Tender, TenderStatus, ActivityLog, DynamicLists, BidType, Lot } from './types';
import { Dashboard } from './components/Dashboard';
import { DynamicSelect } from './components/DynamicSelect';
import { supabase } from './lib/supabaseClient'; 

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<keyof DynamicLists | ''>('');
  const [newItemValue, setNewItemValue] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    
  const [managingTender, setManagingTender] = useState<Tender & { 
    retornoQualquerMomento?: boolean;
    valorFinal?: number;
    dataLimiteRecurso?: string;
    horaLimiteRecurso?: string;
    motivoRecursoProposta?: boolean;
    motivoRecursoHabilitacao?: boolean;
  } | null>(null);

  const [listas, setListas] = useState<DynamicLists>({
    empresas: ['Construtora ABC Ltda', 'Empresa XYZ S.A.', 'Tech Solutions'],
    portais: ['Compras.gov', 'Licitações-e', 'BLL', 'Portal Nacional'],
    categorias: ['Engenharia', 'Tecnologia da Informação', 'Serviços', 'Material', 'Consultoria'],
    situacoes: ['Triagem', 'Em Disputa', 'Suspenso', 'Homologado'],
    modosDisputa: ['Aberto', 'Fechado', 'Aberto/Fechado', 'Não Aplicável'],
    responsaveis: ['João Queiroz', 'Maria Silva', 'Pedro Santos', 'Ana Costa'],
    statusAtual: Object.values(TenderStatus),
    posicoes: ['N/A', '1º Lugar', '2º Lugar', '3º Lugar', 'Desclassificado', 'Perdendo'],
    fasesProcesso: ['Lances', 'Negociação', 'Habilitação', 'Intenção de Recurso', 'Adjudicação', 'Homologação', 'Suspenso']
  });

  const [tenders, setTenders] = useState<Tender[]>([]);
    
  // --- 1. CARREGAR DADOS DO SUPABASE ---
  useEffect(() => {
    fetchTenders();
    const savedLists = localStorage.getItem('qa_lists');
    if (savedLists) setListas(JSON.parse(savedLists));
  }, []);

  async function fetchTenders() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('licitacoes').select('*');
      
      if (error) {
        console.error('Erro ao buscar licitações:', error);
      } else if (data) {
        const todayISO = new Date().toLocaleDateString('en-CA');
        const updatedTenders = data.map((t: any) => {
           if (t.retornoQualquerMomento && t.dataRetorno && t.dataRetorno < todayISO) {
             return { ...t, dataRetorno: todayISO };
           }
           return t;
        });
        setTenders(updatedTenders);
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    localStorage.setItem('qa_lists', JSON.stringify(listas));
  }, [listas]);

  // FUNÇÕES DE FORMATAÇÃO E LÓGICA
  const handleCurrencyInput = (field: string, value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    const numberValue = Number(onlyDigits) / 100;
    handleInputChange(field, numberValue);
  };

  const formatCurrencyDisplay = (value: number | undefined) => {
    if (value === undefined || value === null) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const hasValues = (t: Tender) => {
    if (t.tipoLicitacao === 'Valor') return t.valorMinimo && t.valorMinimo > 0;
    return t.percentualDesconto && t.percentualDesconto > 0;
  };

  const today = new Date();
  const localToday = today.toLocaleDateString('en-CA'); 

  const upcomingTenders = tenders.filter(t => t.dataAbertura >= localToday).sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura));
  const needsDiligence = upcomingTenders.filter(t => !hasValues(t));
  const impugnacoes = tenders.filter(t => {
    const dates = [t.prazoImpugnacao, t.prazoEsclarecimento].filter(Boolean);
    return dates.some(d => d! >= localToday);
  });
  const aptos = upcomingTenders.filter(t => hasValues(t));

  const stats = [
    { label: 'Próximas Licitações', value: upcomingTenders.length, icon: Calendar, color: 'bg-blue-600', sub: 'Aberturas futuras' },
    { label: 'Pendente de valores mínimos', value: needsDiligence.length, icon: DollarSign, color: 'bg-rose-600', sub: 'Pendente de Participação' },
    { label: 'Impugnações e Esclarecimentos', value: impugnacoes.length, icon: Gavel, color: 'bg-amber-500', sub: 'Prazos em aberto' },
    { label: 'Apto para Participação', value: aptos.length, icon: CheckCircle2, color: 'bg-emerald-600', sub: 'Participação confirmada' },
  ];

  const initialFormState = {
    empresa: '', orgaoLicitante: '', numeroEdital: '', portal: '', objeto: '', categoria: '', situacao: 'Triagem', dataAbertura: '', horarioSessao: '', modoDisputa: '', prazoImpugnacao: '', prazoEsclarecimento: '', responsavel: '', valorReferencia: 0, validadeProposta: '60', exigeGarantia: false, valorGarantia: 0, propostaEnviada: false, tipoLicitacao: 'Valor', valorMinimo: 0, percentualDesconto: 0, statusAtual: TenderStatus.TRIAGEM, posicaoAtual: 'N/A', faseAtual: 'Lances', tipoLote: 'Unico', lotes: [], observacoes: '', recebeuValores: false,
  };

  const [formData, setFormData] = useState<Partial<Tender> & { recebeuValores: boolean }>(initialFormState);

  const handleInputChange = (field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); };

  const handleEditProposal = (tender: Tender) => {
    setEditingId(tender.id);
    const temValores = (tender.valorMinimo && tender.valorMinimo > 0) || (tender.percentualDesconto && tender.percentualDesconto > 0);
    setFormData({ ...tender, recebeuValores: !!temValores });
    setActiveMenu('cadastro-propostas');
    setActiveTab(3);
  };

  // --- 2. SALVAR NO SUPABASE ---
  const handleSave = async () => {
    const tenderData = { ...formData as Tender };
    
    if (!editingId) {
       tenderData.id = Math.random().toString(36).substr(2, 9);
       tenderData.createdAt = new Date().toISOString();
       tenderData.lotes = formData.lotes || [];
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('licitacoes').update(tenderData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('licitacoes').insert(tenderData);
        if (error) throw error;
      }

      await fetchTenders(); 
      setShowSuccess(true);
      setTimeout(() => { 
        setShowSuccess(false); 
        setActiveMenu('acompanhamento-licitacoes'); 
        setActiveTab(1); 
        setEditingId(null); 
        setFormData(initialFormState); 
      }, 1500);

    } catch (error: any) {
      alert('Erro ao salvar no banco: ' + error.message);
    }
  };

  const openModal = (type: string) => { setModalType(type as keyof DynamicLists); setNewItemValue(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalType(''); };
  const addItem = () => { if (newItemValue.trim() && modalType) { setListas(prev => ({ ...prev, [modalType]: [...prev[modalType as keyof DynamicLists], newItemValue.trim()] })); closeModal(); } };
  const removeItem = (type: keyof DynamicLists, index: number) => { setListas(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) })); };
  
  const handleUpdateTender = async () => { 
    if (!managingTender) return; 
    try {
      const { error } = await supabase.from('licitacoes').update(managingTender).eq('id', managingTender.id);
      if (error) throw error;
      await fetchTenders();
      setManagingTender(null);
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  const deleteTender = async (id: string) => { 
    if (confirm('Deseja realmente excluir este processo?')) { 
      try {
        const { error } = await supabase.from('licitacoes').delete().eq('id', id);
        if (error) throw error;
        await fetchTenders();
        setManagingTender(null);
      } catch (err: any) {
        alert("Erro ao excluir: " + err.message);
      }
    } 
  };
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {showModal && modalType && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-black text-zinc-900 capitalize">Gerenciar: {modalType}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-zinc-200 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <div className="p-8">
              <div className="flex gap-2 mb-6">
                <input type="text" value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} placeholder="Novo item..." className="flex-1 px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" onKeyPress={(e) => e.key === 'Enter' && addItem()} />
                <button onClick={addItem} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-violet-700 transition-colors">Add</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {listas[modalType].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200 group">
                    <span className="text-sm font-bold text-zinc-700">{item}</span>
                    <button onClick={() => removeItem(modalType, idx)} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {managingTender && (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md flex items-center justify-center z-[130] p-6 overflow-y-auto">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-violet-200"><Edit3 className="w-8 h-8" /></div>
                <div><h3 className="text-2xl font-black text-zinc-900 leading-tight">Painel de Acompanhamento</h3><p className="text-sm font-bold text-violet-600 uppercase tracking-widest flex items-center gap-2">{managingTender.numeroEdital} <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> {managingTender.empresa}</p></div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setManagingTender(null)} className="p-4 hover:bg-zinc-200 rounded-full transition-all"><X className="w-6 h-6 text-zinc-500" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3"><FileText className="w-4 h-4" /> Status & Fluxo</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <DynamicSelect label="Status Atual" value={managingTender.statusAtual} onChange={(v) => setManagingTender({...managingTender, statusAtual: v as TenderStatus})} options={listas.statusAtual} listType="statusAtual" onAddClick={openModal} />
                      <DynamicSelect label="Fase do Processo" value={managingTender.faseAtual} onChange={(v) => setManagingTender({...managingTender, faseAtual: v})} options={listas.fasesProcesso} listType="fasesProcesso" onAddClick={openModal} />
                    </div>
                  </div>
                  <div className="bg-violet-50 rounded-[40px] p-8 border border-violet-100 space-y-6">
                    <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><Award className="w-5 h-5 text-violet-600" /> Resultado da Disputa</h4>
                    <select value={managingTender.posicaoAtual} onChange={(e) => setManagingTender({...managingTender, posicaoAtual: e.target.value})} className="w-full px-6 py-4 bg-white border border-zinc-200 rounded-2xl font-black text-zinc-800 shadow-sm outline-none focus:ring-4 focus:ring-violet-100 transition-all">
                      <option value="N/A">Definir Colocação...</option>
                      {listas.posicoes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
               </div>
               
               {managingTender.faseAtual === 'Intenção de Recurso' && (
                <div className="bg-orange-50 rounded-[40px] p-8 border border-orange-200 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-lg font-black text-orange-800 flex items-center gap-3"><Scale className="w-6 h-6 text-orange-600" /> Gestão de Intenção de Recurso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex flex-col"><label className="text-[10px] font-black text-orange-700 uppercase mb-2">Prazo Fatal (Data)</label><input type="date" value={managingTender.dataLimiteRecurso || ''} onChange={(e) => setManagingTender({...managingTender, dataLimiteRecurso: e.target.value})} className="px-5 py-3 bg-white border border-orange-200 rounded-2xl font-bold text-orange-900 focus:ring-4 focus:ring-orange-100 outline-none" /></div>
                      <div className="flex flex-col"><label className="text-[10px] font-black text-orange-700 uppercase mb-2">Hora Limite (Opcional)</label><input type="time" value={managingTender.horaLimiteRecurso || ''} onChange={(e) => setManagingTender({...managingTender, horaLimiteRecurso: e.target.value})} className="px-5 py-3 bg-white border border-orange-200 rounded-2xl font-bold text-orange-900 focus:ring-4 focus:ring-orange-100 outline-none" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-orange-100 space-y-4">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Motivação</p>
                      <div className="flex items-center gap-3"><input type="checkbox" checked={managingTender.motivoRecursoProposta || false} onChange={(e) => setManagingTender({...managingTender, motivoRecursoProposta: e.target.checked})} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" /><span className="font-bold text-zinc-700">Contra Proposta</span></div>
                      <div className="flex items-center gap-3"><input type="checkbox" checked={managingTender.motivoRecursoHabilitacao || false} onChange={(e) => setManagingTender({...managingTender, motivoRecursoHabilitacao: e.target.checked})} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" /><span className="font-bold text-zinc-700">Contra Habilitação</span></div>
                    </div>
                  </div>
                </div>
               )}

               <div className="bg-emerald-50/50 rounded-[40px] p-8 border border-emerald-100 space-y-6">
                  <div className="flex items-center justify-between"><h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><DollarSign className="w-5 h-5 text-emerald-600" /> Controle Financeiro</h4><span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase text-emerald-600 border border-emerald-100">Edição Rápida</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 uppercase">Valor Referência</label><input type="text" value={formatCurrencyDisplay(managingTender.valorReferencia)} onChange={(e) => {const val = Number(e.target.value.replace(/\D/g, "")) / 100; setManagingTender({...managingTender, valorReferencia: val});}} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-500" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-zinc-400 uppercase">{managingTender.tipoLicitacao === 'Valor' ? 'Mínimo (R$)' : 'Desconto Máx (%)'}</label><input type={managingTender.tipoLicitacao === 'Valor' ? "text" : "number"} value={managingTender.tipoLicitacao === 'Valor' ? formatCurrencyDisplay(managingTender.valorMinimo) : managingTender.percentualDesconto} onChange={(e) => {if (managingTender.tipoLicitacao === 'Valor') {const val = Number(e.target.value.replace(/\D/g, "")) / 100; setManagingTender({...managingTender, valorMinimo: val});} else {setManagingTender({...managingTender, percentualDesconto: parseFloat(e.target.value)});}}} className="w-full px-3 py-3 bg-white border border-zinc-200 text-zinc-800 rounded-xl font-bold text-sm" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-emerald-600 uppercase">Valor Final (Arrematado)</label><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-emerald-600 font-bold text-xs">R$</span></div><input type="text" value={formatCurrencyDisplay(managingTender.valorFinal)} onChange={(e) => {const val = Number(e.target.value.replace(/\D/g, "")) / 100; setManagingTender({...managingTender, valorFinal: val});}} className="w-full pl-8 pr-4 py-3 bg-emerald-100 border border-emerald-200 rounded-xl font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500" placeholder="0,00" /></div></div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
                  <div className="lg:col-span-4 space-y-6">
                    <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><CalendarClock className="w-5 h-5 text-amber-500" /> Próximo Evento (Retorno)</h4>
                    <div className="space-y-4">
                      <input type="date" value={managingTender.dataRetorno || ''} onChange={(e) => setManagingTender({...managingTender, dataRetorno: e.target.value})} className="w-full px-5 py-4 bg-white border border-zinc-300 rounded-2xl font-bold" />
                      <input type="time" value={managingTender.horarioRetorno || ''} disabled={managingTender.retornoQualquerMomento} onChange={(e) => setManagingTender({...managingTender, horarioRetorno: e.target.value})} className={`w-full px-5 py-4 bg-white border border-zinc-300 rounded-2xl font-bold ${managingTender.retornoQualquerMomento ? 'opacity-50 cursor-not-allowed bg-zinc-100' : ''}`} />
                      <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100"><input type="checkbox" checked={managingTender.retornoQualquerMomento || false} onChange={(e) => setManagingTender({...managingTender, retornoQualquerMomento: e.target.checked, horarioRetorno: e.target.checked ? '' : managingTender.horarioRetorno})} className="w-5 h-5 rounded text-amber-600" /><label className="text-xs font-black uppercase text-amber-800">Voltar a qualquer momento</label></div>
                    </div>
                  </div>
                  <div className="lg:col-span-8 space-y-6">
                    <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><MessageSquare className="w-5 h-5 text-emerald-500" /> Observações</h4>
                    <textarea rows={6} value={managingTender.observacoesPregao || ''} onChange={(e) => setManagingTender({...managingTender, observacoesPregao: e.target.value})} className="w-full px-8 py-6 bg-emerald-50/20 border border-emerald-100 rounded-[40px] resize-none font-medium" />
                  </div>
               </div>
            </div>
            <div className="p-10 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <button onClick={() => deleteTender(managingTender.id)} className="px-6 py-4 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 rounded-2xl">Excluir</button>
              <div className="flex gap-4">
                <button onClick={() => setManagingTender(null)} className="px-8 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 rounded-2xl transition-all">Cancelar</button>
                <button onClick={handleUpdateTender} className="px-14 py-4 bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl hover:bg-violet-700 transition-all flex items-center gap-3"><Save className="w-5 h-5" /> Salvar</button>
              </div>
            </div>
           </div>
        </div>
      )}

      <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col z-50">
        <div className="p-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-200 hover:scale-105 transition-transform"><Zap className="w-7 h-7 text-white" /></div>
            <div><h1 className="text-2xl font-black text-zinc-900 tracking-tighter">SISTEMA QZ</h1><p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.1em] opacity-90">Gestão de Licitações</p></div>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Resumo Geral' }, { id: 'cadastro-propostas', icon: FilePlus, label: 'Cadastro de Propostas' }, { id: 'acompanhamento-licitacoes', icon: ListTodo, label: 'Acompanhamento' }].map((item) => (
            <button key={item.id} onClick={() => { setActiveMenu(item.id); if(item.id === 'cadastro-propostas') { setEditingId(null); setFormData(initialFormState); setActiveTab(1); } }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-wider ${activeMenu === item.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-200' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}><item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-white' : 'text-zinc-400'}`} />{item.label}</button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-10 flex items-center justify-between z-40">
          <div><h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{activeMenu === 'cadastro-propostas' && editingId ? 'Editando Proposta' : activeMenu.replace('-', ' ')}</h2></div>
          <div className="flex items-center gap-6">
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input placeholder="Pesquisar..." className="bg-zinc-100 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm w-80 font-bold focus:ring-2 focus:ring-violet-500 outline-none transition-all" /></div>
            <button className="p-3.5 bg-zinc-100 text-zinc-600 rounded-2xl relative hover:bg-zinc-200 transition-colors"><Bell className="w-6 h-6" /><span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-zinc-300">
          <div className="max-w-7xl mx-auto space-y-10">
            {showSuccess && <div className="bg-emerald-500 p-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-emerald-100 animate-in slide-in-from-top duration-300"><CheckCircle className="w-6 h-6 text-white" /><div><p className="text-white font-black uppercase text-xs">Sucesso!</p><p className="text-emerald-100 text-sm font-bold">Processo salvo com sucesso.</p></div></div>}

            {loading && (
              <div className="text-center py-10">
                <p className="font-bold text-zinc-500 animate-pulse">Carregando dados da nuvem...</p>
              </div>
            )}

            {!loading && (activeMenu === 'dashboard' || activeMenu === 'acompanhamento-licitacoes') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}><stat.icon className="w-6 h-6" /></div>
                          <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                        </div>
                        <div><p className="text-sm font-black text-slate-800 leading-tight">{stat.label}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.sub}</p></div>
                      </div>
                    ))}
                  </div>

                  <Dashboard tenders={tenders} onEdit={handleEditProposal} currentDate={currentDate} setCurrentDate={setCurrentDate} />
                  
                  <div className="space-y-12">
                    {Array.from(new Set(tenders.map(t => t.empresa))).map((company) => {
                      const companyTenders = tenders.filter(t => t.empresa === company);
                      return (
                        <div key={company} className="bg-white rounded-[48px] border border-zinc-200 shadow-sm overflow-hidden">
                          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm"><Building className="w-6 h-6 text-violet-600" /></div>
                            <div><h3 className="text-lg font-black text-zinc-900">{company}</h3><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{companyTenders.length} Processos</p></div>
                          </div>
                          <table className="w-full text-left">
                            <thead><tr className="bg-zinc-50/50 border-b border-zinc-100"><th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Processo</th><th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th><th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Resultado</th><th className="p-8"></th></tr></thead>
                            <tbody className="divide-y divide-zinc-50">
                              {companyTenders.map((tender) => (
                                <tr key={tender.id} className="hover:bg-zinc-50/50 group transition-all cursor-pointer" onClick={() => setManagingTender(tender)}>
                                  <td className="p-8"><p className="font-black text-zinc-900 text-base">{tender.numeroEdital}</p><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{tender.orgaoLicitante}</p></td>
                                  <td className="p-8"><span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${tender.statusAtual === TenderStatus.EM_DISPUTA ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{tender.statusAtual}</span></td>
                                  <td className="p-8"><p className="text-lg font-black text-zinc-800">{tender.posicaoAtual}</p></td>
                                  <td className="p-8 text-right"><button onClick={(e) => { e.stopPropagation(); setManagingTender(tender); }} className="px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-violet-600 transition-all">Gerenciar</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 h-full sticky top-8">
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Agenda Operacional</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin">
                      {upcomingTenders.map((t, idx) => {
                        const hasValues = (t.tipoLicitacao === 'Valor' && t.valorMinimo > 0) || (t.percentualDesconto && t.percentualDesconto > 0);
                        return (
                          <div key={idx} onClick={() => handleEditProposal(t)} className="cursor-pointer p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="flex gap-4 mb-3">
                              <div className={`w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm ${hasValues ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(t.dataAbertura).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                <span className="text-lg font-black text-slate-900">{new Date(t.dataAbertura).getDate()}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-slate-900 truncate" title={t.orgaoLicitante}>{t.orgaoLicitante || 'Órgão'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{t.numeroEdital} • {t.empresa}</p>
                              </div>
                            </div>
                            {!hasValues && (
                              <div className="mb-3 p-3 bg-rose-600 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-100">
                                <AlertTriangle className="w-5 h-5 text-white" />
                                <div><p className="text-[10px] font-black text-white uppercase leading-none">Pendente</p><p className="text-[9px] font-bold text-rose-50 uppercase mt-1">Aguardando valores</p></div>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <span className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {(t as any).retornoQualquerMomento ? "Qqr. Momento" : (t.horarioSessao || '--:--')}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${hasValues ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>{hasValues ? 'Apto' : 'Urgência'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'cadastro-propostas' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                 <div className="flex gap-2 bg-white p-2 rounded-[28px] border border-zinc-200 shadow-sm">
                   {[{ id: 1, icon: Building, label: 'Empresa & Órgão' }, { id: 2, icon: Clock, label: 'Prazos' }, { id: 3, icon: DollarSign, label: 'Financeiro' }].map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-100' : 'text-zinc-400 hover:bg-zinc-50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
                   ))}
                 </div>
                 <div className="bg-white rounded-[48px] border border-zinc-200 p-12 space-y-10 min-h-[500px] shadow-sm">
                   {activeTab === 1 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                       <DynamicSelect label="Empresa Participante" value={formData.empresa || ''} onChange={(v) => handleInputChange('empresa', v)} options={listas.empresas} listType="empresas" onAddClick={openModal} required />
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Órgão Licitante</label><input value={formData.orgaoLicitante} onChange={(e) => handleInputChange('orgaoLicitante', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Número do Edital</label><input value={formData.numeroEdital} onChange={(e) => handleInputChange('numeroEdital', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <DynamicSelect label="Plataforma / Portal" value={formData.portal || ''} onChange={(v) => handleInputChange('portal', v)} options={listas.portais} listType="portais" onAddClick={openModal} />
                       <div className="md:col-span-2"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Objeto</label><textarea rows={4} value={formData.objeto} onChange={(e) => handleInputChange('objeto', e.target.value)} className="w-full px-6 py-5 bg-zinc-50 border border-zinc-200 rounded-3xl font-medium focus:ring-4 focus:ring-violet-50 outline-none resize-none" /></div>
                     </div>
                   )}
                   {activeTab === 2 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Data da Abertura</label><input type="date" value={formData.dataAbertura} onChange={(e) => handleInputChange('dataAbertura', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Hora da Sessão</label><input type="time" value={formData.horarioSessao} onChange={(e) => handleInputChange('horarioSessao', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Prazo para Esclarecimento</label><input type="date" value={formData.prazoEsclarecimento} onChange={(e) => handleInputChange('prazoEsclarecimento', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Prazo para Impugnação</label><input type="date" value={formData.prazoImpugnacao} onChange={(e) => handleInputChange('prazoImpugnacao', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                       <DynamicSelect label="Modo de Disputa" value={formData.modoDisputa || ''} onChange={(v) => handleInputChange('modoDisputa', v)} options={listas.modosDisputa} listType="modosDisputa" onAddClick={openModal} />
                     </div>
                   )}
                   {activeTab === 3 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                       <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Valor Referência</label><div className="relative group"><div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><span className="text-zinc-400 font-black">R$</span></div><input type="text" value={formatCurrencyDisplay(formData.valorReferencia)} onChange={(e) => handleCurrencyInput('valorReferencia', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-zinc-900 focus:ring-4 focus:ring-violet-50 focus:border-violet-300 outline-none" /></div></div>
                       <div className="md:col-span-2 flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200"><input type="checkbox" checked={formData.recebeuValores} onChange={(e) => handleInputChange('recebeuValores', e.target.checked)} className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500" /><label className="text-sm font-black text-zinc-700 uppercase">A empresa enviou os valores mínimos?</label></div>
                       {formData.recebeuValores && (
                         <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-200 md:col-span-2 space-y-6 animate-in slide-in-from-top-4 duration-300">
                           <h4 className="text-sm font-black text-zinc-900 uppercase flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /> Valor Mínimo do Cliente</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="flex flex-col"><label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">Tipo de Limite</label><div className="flex bg-white p-1 rounded-xl border border-zinc-200"><button onClick={() => handleInputChange('tipoLicitacao', 'Valor')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipoLicitacao === 'Valor' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}>Valor Fixo (R$)</button><button onClick={() => handleInputChange('tipoLicitacao', 'Desconto')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipoLicitacao === 'Desconto' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}>Desconto (%)</button></div></div>
                             <div className="flex flex-col"><label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">{formData.tipoLicitacao === 'Valor' ? 'Valor Mínimo Aceitável (R$)' : 'Percentual Máximo de Desconto (%)'}</label><div className="relative group">{formData.tipoLicitacao === 'Valor' && (<div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><span className="text-zinc-400 font-black">R$</span></div>)}<input type={formData.tipoLicitacao === 'Valor' ? "text" : "number"} value={formData.tipoLicitacao === 'Valor' ? formatCurrencyDisplay(formData.valorMinimo) : formData.percentualDesconto} onChange={(e) => {if (formData.tipoLicitacao === 'Valor') {handleCurrencyInput('valorMinimo', e.target.value);} else {handleInputChange('percentualDesconto', parseFloat(e.target.value));}}} className={`w-full ${formData.tipoLicitacao === 'Valor' ? 'pl-12' : 'pl-5'} pr-5 py-2.5 bg-white border border-zinc-200 rounded-xl font-black text-zinc-900 focus:ring-2 focus:ring-emerald-500 outline-none`} placeholder={formData.tipoLicitacao === 'Valor' ? "0,00" : "0%"} /></div></div>
                           </div>
                         </div>
                       )}
                     </div>
                   )}
                   <div className="flex items-center justify-between pt-10 border-t border-zinc-100">
                     <button onClick={() => setActiveTab(prev => Math.max(1, prev - 1))} disabled={activeTab === 1} className="px-8 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest disabled:opacity-20 hover:bg-zinc-100 rounded-2xl transition-all"><ArrowLeft className="w-4 h-4 inline mr-2" /> Voltar</button>
                     {activeTab < 3 ? <button onClick={() => setActiveTab(prev => Math.min(3, prev + 1))} className="px-10 py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-zinc-200 hover:scale-105 transition-all">Próximo Passo</button> : <button onClick={handleSave} className="px-12 py-4 bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-all hover:bg-violet-700"><Save className="w-5 h-5" /> {editingId ? 'Salvar Edição' : 'Salvar & Iniciar'}</button>}
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

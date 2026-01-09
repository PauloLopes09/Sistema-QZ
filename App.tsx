import React, { useState, useEffect } from 'react';
import { 
  Home, FilePlus, Clipboard, BarChart2, Settings, 
  Search, Bell, Zap, X, Trash2, Plus, 
  Building, Clock, DollarSign, FileCheck, Save, ArrowLeft,
  LayoutDashboard, ListTodo, History, Info, CheckCircle,
  AlertTriangle, Percent, FileText, Gavel, Layers, CalendarClock, MessageSquare,
  Edit3, Filter, CheckCircle2, PlayCircle, Timer, Calendar, ChevronLeft, ChevronRight,
  Flag, Award, ArrowRightCircle
} from 'lucide-react';
import { Tender, TenderStatus, ActivityLog, DynamicLists, BidType, Lot } from './types';
import { Dashboard } from './components/Dashboard';
import { DynamicSelect } from './components/DynamicSelect';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(1);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<keyof DynamicLists | ''>('');
  const [newItemValue, setNewItemValue] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
   
  const [managingTender, setManagingTender] = useState<Tender | null>(null);

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
   
  useEffect(() => {
    const savedTenders = localStorage.getItem('qa_tenders');
    if (savedTenders) setTenders(JSON.parse(savedTenders));
    const savedLists = localStorage.getItem('qa_lists');
    if (savedLists) setListas(JSON.parse(savedLists));
  }, []);

  useEffect(() => {
    localStorage.setItem('qa_tenders', JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem('qa_lists', JSON.stringify(listas));
  }, [listas]);

  // Adicionei 'recebeuValores' ao estado do formulário para controlar a visualização
  const [formData, setFormData] = useState<Partial<Tender> & { recebeuValores: boolean }>({
    empresa: '',
    orgaoLicitante: '',
    numeroEdital: '',
    portal: '',
    objeto: '',
    categoria: '',
    situacao: 'Triagem',
    dataAbertura: '',
    horarioSessao: '',
    modoDisputa: '',
    prazoImpugnacao: '',
    prazoEsclarecimento: '',
    responsavel: '',
    valorReferencia: 0,
    validadeProposta: '60',
    exigeGarantia: false,
    valorGarantia: 0,
    propostaEnviada: false,
    tipoLicitacao: 'Valor',
    valorMinimo: 0,
    percentualDesconto: 0,
    statusAtual: TenderStatus.TRIAGEM,
    posicaoAtual: 'N/A',
    faseAtual: 'Lances',
    tipoLote: 'Unico',
    lotes: [],
    observacoes: '',
    recebeuValores: false, // Novo campo para controlar a lógica
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (type: string) => {
    setModalType(type as keyof DynamicLists);
    setNewItemValue('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  const addItem = () => {
    if (newItemValue.trim() && modalType) {
      setListas(prev => ({
        ...prev,
        [modalType]: [...prev[modalType as keyof DynamicLists], newItemValue.trim()]
      }));
      closeModal();
    }
  };

  const removeItem = (type: keyof DynamicLists, index: number) => {
    setListas(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const newTender: Tender = {
      ...formData as Tender,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      lotes: formData.lotes || []
    };
    setTenders(prev => [newTender, ...prev]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveMenu('acompanhamento-licitacoes'); 
      setActiveTab(1);
    }, 2000);
  };

  const handleUpdateTender = () => {
    if (!managingTender) return;
    setTenders(prev => prev.map(t => t.id === managingTender.id ? managingTender : t));
    setManagingTender(null);
  };

  const deleteTender = (id: string) => {
    if (confirm('Deseja realmente excluir este processo?')) {
      setTenders(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleFinalizeDispute = (tender: Tender) => {
    const nextStatus = TenderStatus.HABILITACAO;
    const updated = {
      ...tender,
      statusAtual: nextStatus,
      faseAtual: 'Habilitação / Documentação',
      observacoesPregao: (tender.observacoesPregao || '') + `\n[Log ${new Date().toLocaleDateString()}]: Disputa realizada. Movido para Habilitação.`
    };
    setTenders(prev => prev.map(t => t.id === tender.id ? updated : t));
  };

  const updateLot = (lotId: string, field: keyof Lot, value: string) => {
    if (!managingTender) return;
    setManagingTender({
      ...managingTender,
      lotes: managingTender.lotes.map(l => l.id === lotId ? { ...l, [field]: value } : l)
    });
  };

  const removeLot = (lotId: string) => {
    if (!managingTender) return;
    setManagingTender({
      ...managingTender,
      lotes: managingTender.lotes.filter(l => l.id !== lotId)
    });
  };

  const addLotToManaging = () => {
    if (!managingTender) return;
    const newLot: Lot = {
      id: Math.random().toString(36).substr(2, 5),
      numero: (managingTender.lotes.length + 1).toString().padStart(2, '0'),
      colocacao: 'N/A'
    };
    setManagingTender({ ...managingTender, lotes: [...managingTender.lotes, newLot] });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      aberturas: tenders.filter(t => t.dataAbertura === dateStr),
      retornos: tenders.filter(t => t.dataRetorno === dateStr)
    };
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pregoesHoje = tenders.filter(t => t.dataAbertura === todayStr);
  const retornosHoje = tenders.filter(t => t.dataRetorno === todayStr);
  const emDisputaCount = tenders.filter(t => t.statusAtual === TenderStatus.EM_DISPUTA || t.statusAtual === TenderStatus.AGUARDANDO_DISPUTA).length;

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
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 leading-tight">Painel de Acompanhamento</h3>
                  <p className="text-sm font-bold text-violet-600 uppercase tracking-widest flex items-center gap-2">{managingTender.numeroEdital} <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> {managingTender.empresa}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  {(managingTender.statusAtual === TenderStatus.EM_DISPUTA || managingTender.statusAtual === TenderStatus.TRIAGEM || managingTender.statusAtual === TenderStatus.AGUARDANDO_DISPUTA) && (
                    <button onClick={() => handleFinalizeDispute(managingTender)} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all hover:scale-105"><Award className="w-5 h-5" /> Concluir Disputa</button>
                  )}
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

              {/* SEÇÃO FINANCEIRA DE EDIÇÃO RÁPIDA NO MODAL */}
              <div className="bg-emerald-50/50 rounded-[40px] p-8 border border-emerald-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" /> Controle Financeiro
                  </h4>
                  <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase text-emerald-600 border border-emerald-100">Edição Rápida</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase">Valor Referência</label>
                    <input 
                      type="number" 
                      value={managingTender.valorReferencia} 
                      onChange={(e) => setManagingTender({...managingTender, valorReferencia: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-500"
                    />
                  </div>

                  <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">Tipo de Limite</label>
                      <select 
                        value={managingTender.tipoLicitacao || 'Valor'}
                        onChange={(e) => setManagingTender({...managingTender, tipoLicitacao: e.target.value as 'Valor' | 'Desconto'})}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-sm"
                      >
                        <option value="Valor">Valor (R$)</option>
                        <option value="Desconto">Desconto (%)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">
                        {managingTender.tipoLicitacao === 'Valor' ? 'Mínimo (R$)' : 'Desconto Máx (%)'}
                      </label>
                      <input 
                        type="number" 
                        value={managingTender.tipoLicitacao === 'Valor' ? managingTender.valorMinimo : managingTender.percentualDesconto}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (managingTender.tipoLicitacao === 'Valor') {
                            setManagingTender({...managingTender, valorMinimo: val});
                          } else {
                            setManagingTender({...managingTender, percentualDesconto: val});
                          }
                        }}
                        className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-black text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-[40px] p-8 border border-zinc-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-zinc-900">Mapa de Lotes</h4>
                  <div className="flex p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                    <button onClick={() => setManagingTender({...managingTender, tipoLote: 'Unico'})} className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${managingTender.tipoLote === 'Unico' ? 'bg-violet-600 text-white' : 'text-zinc-400'}`}>Lote Único</button>
                    <button onClick={() => setManagingTender({...managingTender, tipoLote: 'Multiplos'})} className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${managingTender.tipoLote === 'Multiplos' ? 'bg-violet-600 text-white' : 'text-zinc-400'}`}>Múltiplos</button>
                  </div>
                </div>
                {managingTender.tipoLote === 'Multiplos' && (
                  <div className="space-y-4">
                    {managingTender.lotes.map((lot) => (
                      <div key={lot.id} className="grid grid-cols-12 gap-6 items-center bg-white p-5 rounded-[24px] border border-zinc-200">
                        <div className="col-span-3"><input type="text" value={lot.numero} onChange={(e) => updateLot(lot.id, 'numero', e.target.value)} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-black" /></div>
                        <div className="col-span-7"><select value={lot.colocacao} onChange={(e) => updateLot(lot.id, 'colocacao', e.target.value)} className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-black">{listas.posicoes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div className="col-span-2 text-right"><button onClick={() => removeLot(lot.id)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-2xl"><Trash2 className="w-5 h-5" /></button></div>
                      </div>
                    ))}
                    <button onClick={addLotToManaging} className="w-full py-5 border-2 border-dashed border-zinc-300 rounded-[24px] text-zinc-400 hover:text-violet-600 hover:border-violet-300 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"><Plus className="w-5 h-5" /> Adicionar Lote</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
                <div className="lg:col-span-4 space-y-6">
                  <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><CalendarClock className="w-5 h-5 text-amber-500" /> Próximo Evento (Retorno)</h4>
                  <div className="space-y-4">
                    <input type="date" value={managingTender.dataRetorno || ''} onChange={(e) => setManagingTender({...managingTender, dataRetorno: e.target.value})} className="w-full px-5 py-4 bg-white border border-zinc-300 rounded-2xl font-bold" />
                    <input type="time" value={managingTender.horarioRetorno || ''} onChange={(e) => setManagingTender({...managingTender, horarioRetorno: e.target.value})} className="w-full px-5 py-4 bg-white border border-zinc-300 rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3"><MessageSquare className="w-5 h-5 text-emerald-500" /> Observações do Pregão / Chat</h4>
                  <textarea rows={6} value={managingTender.observacoesPregao || ''} onChange={(e) => setManagingTender({...managingTender, observacoesPregao: e.target.value})} className="w-full px-8 py-6 bg-emerald-50/20 border border-emerald-100 rounded-[40px] resize-none font-medium text-zinc-800 focus:ring-4 focus:ring-emerald-50 outline-none transition-all" placeholder="Histórico do chat, negociações, intenções de recurso..." />
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <button onClick={() => deleteTender(managingTender.id)} className="px-6 py-4 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 rounded-2xl">Excluir Processo</button>
              <div className="flex gap-4">
                <button onClick={() => setManagingTender(null)} className="px-8 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 rounded-2xl transition-all">Cancelar</button>
                <button onClick={handleUpdateTender} className="px-14 py-4 bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] transition-all flex items-center gap-3"><Save className="w-5 h-5" /> Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col z-50">
        <div className="p-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-200 hover:scale-105 transition-transform"><Zap className="w-7 h-7 text-white" /></div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">SISTEMA QZ</h1>
              <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.1em] opacity-90">Gestão de Licitações</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Resumo Geral' }, { id: 'cadastro-propostas', icon: FilePlus, label: 'Cadastro de Propostas' }, { id: 'acompanhamento-licitacoes', icon: ListTodo, label: 'Acompanhamento' }].map((item) => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-wider ${activeMenu === item.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-200' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}><item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-white' : 'text-zinc-400'}`} />{item.label}</button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-10 flex items-center justify-between z-40">
          <div><h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{activeMenu.replace('-', ' ')}</h2></div>
          <div className="flex items-center gap-6">
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><input placeholder="Pesquisar..." className="bg-zinc-100 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm w-80 font-bold focus:ring-2 focus:ring-violet-500 outline-none transition-all" /></div>
            <button className="p-3.5 bg-zinc-100 text-zinc-600 rounded-2xl relative hover:bg-zinc-200 transition-colors"><Bell className="w-6 h-6" /><span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-zinc-300">
          <div className="max-w-7xl mx-auto space-y-10">
            {showSuccess && <div className="bg-emerald-500 p-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-emerald-100 animate-in slide-in-from-top duration-300"><CheckCircle className="w-6 h-6 text-white" /><div><p className="text-white font-black uppercase text-xs">Sucesso!</p><p className="text-emerald-100 text-sm font-bold">Processo registrado no acompanhamento.</p></div></div>}

            {activeMenu === 'dashboard' && <Dashboard tenders={tenders} onEdit={setManagingTender} />}

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
                      <DynamicSelect label="Responsável" value={formData.responsavel || ''} onChange={(v) => handleInputChange('responsavel', v)} options={listas.responsaveis} listType="responsaveis" onAddClick={openModal} />
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                      <div className="flex flex-col">
                        <label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Valor Referência (R$)</label>
                        <input type="number" value={formData.valorReferencia} onChange={(e) => handleInputChange('valorReferencia', parseFloat(e.target.value))} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" />
                      </div>

                      {/* CHECKBOX: A EMPRESA ENVIOU VALORES? */}
                      <div className="md:col-span-2 flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                        <input 
                          type="checkbox" 
                          checked={formData.recebeuValores} 
                          onChange={(e) => handleInputChange('recebeuValores', e.target.checked)} 
                          className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500"
                        />
                        <label className="text-sm font-black text-zinc-700 uppercase">
                          A empresa enviou os valores mínimos?
                        </label>
                      </div>

                      {/* CAMPOS CONDICIONAIS: SÓ APARECEM SE A EMPRESA MANDOU OS VALORES */}
                      {formData.recebeuValores && (
                        <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-200 md:col-span-2 space-y-6 animate-in slide-in-from-top-4 duration-300">
                          <h4 className="text-sm font-black text-zinc-900 uppercase flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" /> Valor Mínimo do Cliente
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">Tipo de Limite</label>
                              <div className="flex bg-white p-1 rounded-xl border border-zinc-200">
                                <button 
                                  onClick={() => handleInputChange('tipoLicitacao', 'Valor')}
                                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipoLicitacao === 'Valor' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                                >
                                  Valor Fixo (R$)
                                </button>
                                <button 
                                  onClick={() => handleInputChange('tipoLicitacao', 'Desconto')}
                                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.tipoLicitacao === 'Desconto' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                                >
                                  Desconto (%)
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">
                                {formData.tipoLicitacao === 'Valor' ? 'Valor Mínimo Aceitável (R$)' : 'Percentual Máximo de Desconto (%)'}
                              </label>
                              <input 
                                type="number" 
                                value={formData.tipoLicitacao === 'Valor' ? formData.valorMinimo : formData.percentualDesconto} 
                                onChange={(e) => {
                                  if (formData.tipoLicitacao === 'Valor') {
                                    handleInputChange('valorMinimo', parseFloat(e.target.value));
                                  } else {
                                    handleInputChange('percentualDesconto', parseFloat(e.target.value));
                                  }
                                }}
                                className="px-5 py-2.5 bg-white border border-zinc-200 rounded-xl font-black text-zinc-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder={formData.tipoLicitacao === 'Valor' ? "0,00" : "0%"}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mt-2 shadow-sm md:col-span-2">
                        <input type="checkbox" checked={formData.propostaEnviada} onChange={(e) => handleInputChange('propostaEnviada', e.target.checked)} className="w-6 h-6 rounded-lg text-violet-600 focus:ring-violet-500" />
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Proposta já Enviada ao Portal?</label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-10 border-t border-zinc-100">
                    <button onClick={() => setActiveTab(prev => Math.max(1, prev - 1))} disabled={activeTab === 1} className="px-8 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest disabled:opacity-20 hover:bg-zinc-100 rounded-2xl transition-all"><ArrowLeft className="w-4 h-4 inline mr-2" /> Voltar</button>
                    {activeTab < 3 ? <button onClick={() => setActiveTab(prev => Math.min(3, prev + 1))} className="px-10 py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-zinc-200 hover:scale-105 transition-all">Próximo Passo</button> : <button onClick={handleSave} className="px-12 py-4 bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-violet-200 flex items-center gap-3 hover:scale-105 transition-all hover:bg-violet-700"><Save className="w-5 h-5" /> Salvar & Iniciar Acompanhamento</button>}
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

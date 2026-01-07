
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

  const [formData, setFormData] = useState<Partial<Tender>>({
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
  });

  const handleInputChange = (field: keyof Tender, value: any) => {
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

  // Função para finalizar disputa rapidamente
  const handleFinalizeDispute = (tender: Tender) => {
    const nextStatus = TenderStatus.HABILITACAO;
    const updated = {
      ...tender,
      statusAtual: nextStatus,
      faseAtual: 'Habilitação / Documentação',
      observacoesPregao: (tender.observacoesPregao || '') + `\n[Log ${new Date().toLocaleDateString()}]: Disputa realizada. Movido para Habilitação.`
    };
    setManagingTender(updated);
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

  // Lógica Calendário
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Modal de Listas Dinâmicas */}
      {showModal && modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-900 capitalize">Gerenciar: {modalType}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-8">
              <div className="flex gap-2 mb-6">
                <input type="text" value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} placeholder="Novo item..." className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" onKeyPress={(e) => e.key === 'Enter' && addItem()} />
                <button onClick={addItem} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Add</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {listas[modalType].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 group">
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                    <button onClick={() => removeItem(modalType, idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão Operacional */}
      {managingTender && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[130] p-6 overflow-y-auto">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200"><Edit3 className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Painel de Acompanhamento</h3>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">{managingTender.numeroEdital} <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {managingTender.empresa}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 {(managingTender.statusAtual === TenderStatus.EM_DISPUTA || managingTender.statusAtual === TenderStatus.TRIAGEM || managingTender.statusAtual === TenderStatus.AGUARDANDO_DISPUTA) && (
                   <button 
                    onClick={() => handleFinalizeDispute(managingTender)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all hover:scale-105"
                   >
                     <Award className="w-5 h-5" /> Concluir Disputa
                   </button>
                 )}
                 <button onClick={() => setManagingTender(null)} className="p-4 hover:bg-slate-200 rounded-full transition-all"><X className="w-6 h-6 text-slate-500" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3"><FileText className="w-4 h-4" /> Status & Fluxo</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <DynamicSelect label="Status Atual" value={managingTender.statusAtual} onChange={(v) => setManagingTender({...managingTender, statusAtual: v as TenderStatus})} options={listas.statusAtual} listType="statusAtual" onAddClick={openModal} />
                    <DynamicSelect label="Fase do Processo" value={managingTender.faseAtual} onChange={(v) => setManagingTender({...managingTender, faseAtual: v})} options={listas.fasesProcesso} listType="fasesProcesso" onAddClick={openModal} />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-[40px] p-8 border border-blue-100 space-y-6">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-3"><Award className="w-5 h-5 text-blue-600" /> Resultado da Disputa</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informar colocação para fins de histórico e recurso</p>
                  <select 
                    value={managingTender.posicaoAtual}
                    onChange={(e) => setManagingTender({...managingTender, posicaoAtual: e.target.value})}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="N/A">Definir Colocação...</option>
                    {listas.posicoes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-900">Mapa de Lotes</h4>
                  <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <button onClick={() => setManagingTender({...managingTender, tipoLote: 'Unico'})} className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${managingTender.tipoLote === 'Unico' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Lote Único</button>
                    <button onClick={() => setManagingTender({...managingTender, tipoLote: 'Multiplos'})} className={`px-6 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${managingTender.tipoLote === 'Multiplos' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Múltiplos</button>
                  </div>
                </div>
                {managingTender.tipoLote === 'Multiplos' && (
                  <div className="space-y-4">
                    {managingTender.lotes.map((lot) => (
                      <div key={lot.id} className="grid grid-cols-12 gap-6 items-center bg-white p-5 rounded-[24px] border border-slate-200">
                        <div className="col-span-3"><input type="text" value={lot.numero} onChange={(e) => updateLot(lot.id, 'numero', e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black" /></div>
                        <div className="col-span-7"><select value={lot.colocacao} onChange={(e) => updateLot(lot.id, 'colocacao', e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black">{listas.posicoes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div className="col-span-2 text-right"><button onClick={() => removeLot(lot.id)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-2xl"><Trash2 className="w-5 h-5" /></button></div>
                      </div>
                    ))}
                    <button onClick={addLotToManaging} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-[24px] text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"><Plus className="w-5 h-5" /> Adicionar Lote</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
                <div className="lg:col-span-4 space-y-6">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-3"><CalendarClock className="w-5 h-5 text-amber-500" /> Próximo Evento (Retorno)</h4>
                  <div className="space-y-4">
                    <input type="date" value={managingTender.dataRetorno || ''} onChange={(e) => setManagingTender({...managingTender, dataRetorno: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl font-bold" />
                    <input type="time" value={managingTender.horarioRetorno || ''} onChange={(e) => setManagingTender({...managingTender, horarioRetorno: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-3"><MessageSquare className="w-5 h-5 text-emerald-500" /> Observações do Pregão / Chat</h4>
                  <textarea rows={6} value={managingTender.observacoesPregao || ''} onChange={(e) => setManagingTender({...managingTender, observacoesPregao: e.target.value})} className="w-full px-8 py-6 bg-emerald-50/20 border border-emerald-100 rounded-[40px] resize-none font-medium text-slate-800" placeholder="Histórico do chat, negociações, intenções de recurso..." />
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button onClick={() => deleteTender(managingTender.id)} className="px-6 py-4 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 rounded-2xl">Excluir Processo</button>
              <div className="flex gap-4">
                <button onClick={() => setManagingTender(null)} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 rounded-2xl transition-all">Cancelar</button>
                <button onClick={handleUpdateTender} className="px-14 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center gap-3"><Save className="w-5 h-5" /> Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200"><Zap className="w-7 h-7 text-white" /></div>
            <div><h1 className="text-2xl font-black text-slate-900 tracking-tighter">Sistema QA</h1><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] opacity-80">Legal & Bids</p></div>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Resumo Geral' },
            { id: 'cadastro-propostas', icon: FilePlus, label: 'Cadastro de Propostas' },
            { id: 'acompanhamento-licitacoes', icon: ListTodo, label: 'Acompanhamento de licitações' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[12px] uppercase tracking-wider ${activeMenu === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-white' : 'text-slate-400'}`} />{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between z-40">
          <div><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{activeMenu.replace('-', ' ')}</h2></div>
          <div className="flex items-center gap-6">
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input placeholder="Pesquisar..." className="bg-slate-100 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm w-80 font-bold focus:ring-2 focus:ring-blue-500" /></div>
            <button className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl relative"><Bell className="w-6 h-6" /><span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-10">
            {showSuccess && (
              <div className="bg-emerald-500 p-5 rounded-3xl flex items-center gap-4 shadow-xl shadow-emerald-100 animate-in slide-in-from-top duration-300"><CheckCircle className="w-6 h-6 text-white" /><div><p className="text-white font-black uppercase text-xs">Sucesso!</p><p className="text-emerald-100 text-sm font-bold">Processo registrado no acompanhamento.</p></div></div>
            )}

            {activeMenu === 'dashboard' && <Dashboard tenders={tenders} />}

            {activeMenu === 'cadastro-propostas' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex gap-2 bg-white p-2 rounded-[28px] border border-slate-200">
                  {[{ id: 1, icon: Building, label: 'Empresa & Órgão' }, { id: 2, icon: Clock, label: 'Prazos' }, { id: 3, icon: DollarSign, label: 'Financeiro' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
                  ))}
                </div>
                <div className="bg-white rounded-[48px] border border-slate-200 p-12 space-y-10 min-h-[500px] shadow-sm">
                  {activeTab === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                      <DynamicSelect label="Empresa (Seu Cliente)" value={formData.empresa || ''} onChange={(v) => handleInputChange('empresa', v)} options={listas.empresas} listType="empresas" onAddClick={openModal} required />
                      <div className="flex flex-col"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Órgão Licitante *</label><input value={formData.orgaoLicitante} onChange={(e) => handleInputChange('orgaoLicitante', e.target.value)} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-50" /></div>
                      <div className="flex flex-col"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Nº Edital / Processo *</label><input value={formData.numeroEdital} onChange={(e) => handleInputChange('numeroEdital', e.target.value)} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-50" /></div>
                      <DynamicSelect label="Plataforma / Portal" value={formData.portal || ''} onChange={(v) => handleInputChange('portal', v)} options={listas.portais} listType="portais" onAddClick={openModal} />
                      <div className="md:col-span-2"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Objeto Detalhado *</label><textarea rows={4} value={formData.objeto} onChange={(e) => handleInputChange('objeto', e.target.value)} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-medium focus:ring-4 focus:ring-blue-50 outline-none resize-none" /></div>
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                      <div className="flex flex-col"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Data da Abertura *</label><input type="date" value={formData.dataAbertura} onChange={(e) => handleInputChange('dataAbertura', e.target.value)} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" /></div>
                      <div className="flex flex-col"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Hora da Sessão</label><input type="time" value={formData.horarioSessao} onChange={(e) => handleInputChange('horarioSessao', e.target.value)} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" /></div>
                      <DynamicSelect label="Modo de Disputa" value={formData.modoDisputa || ''} onChange={(v) => handleInputChange('modoDisputa', v)} options={listas.modosDisputa} listType="modosDisputa" onAddClick={openModal} />
                      <DynamicSelect label="Responsável" value={formData.responsavel || ''} onChange={(v) => handleInputChange('responsavel', v)} options={listas.responsaveis} listType="responsaveis" onAddClick={openModal} />
                    </div>
                  )}
                  {activeTab === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                      <div className="flex flex-col"><label className="block text-sm font-black text-slate-700 mb-3 uppercase">Valor Referência (R$)</label><input type="number" value={formData.valorReferencia} onChange={(e) => handleInputChange('valorReferencia', parseFloat(e.target.value))} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" /></div>
                      <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8 shadow-sm">
                        <input type="checkbox" checked={formData.propostaEnviada} onChange={(e) => handleInputChange('propostaEnviada', e.target.checked)} className="w-6 h-6 rounded-lg text-blue-600" />
                        <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Proposta já Enviada ao Portal?</label>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                    <button onClick={() => setActiveTab(prev => Math.max(1, prev - 1))} disabled={activeTab === 1} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest disabled:opacity-20"><ArrowLeft className="w-4 h-4 inline mr-2" /> Voltar</button>
                    {activeTab < 3 ? (
                      <button onClick={() => setActiveTab(prev => Math.min(3, prev + 1))} className="px-10 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all">Próximo Passo</button>
                    ) : (
                      <button onClick={handleSave} className="px-12 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-blue-200 flex items-center gap-3 hover:scale-105 transition-all"><Save className="w-5 h-5" /> Salvar & Iniciar Acompanhamento</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'acompanhamento-licitacoes' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 {/* Mini Dash */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 flex items-center gap-6 shadow-sm"><PlayCircle className="w-8 h-8 text-blue-600" /><div><p className="text-3xl font-black">{pregoesHoje.length}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aberturas Hoje</p></div></div>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 flex items-center gap-6 shadow-sm"><Timer className="w-8 h-8 text-amber-600" /><div><p className="text-3xl font-black">{retornosHoje.length}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retornos Pendentes</p></div></div>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 flex items-center gap-6 shadow-sm"><Gavel className="w-8 h-8 text-indigo-600" /><div><p className="text-3xl font-black">{emDisputaCount}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aguardando/Em Disputa</p></div></div>
                 </div>

                 {/* View Switcher */}
                 <div className="flex bg-white p-2 rounded-[28px] border border-slate-200 w-fit shadow-sm">
                    <button onClick={() => setViewType('list')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewType === 'list' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><ListTodo className="w-4 h-4" /> Visão em Lista</button>
                    <button onClick={() => setViewType('calendar')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewType === 'calendar' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Calendar className="w-4 h-4" /> Calendário Operacional</button>
                 </div>

                 {viewType === 'list' ? (
                   <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Processo</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Fase</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agenda</th>
                            <th className="p-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {tenders.length === 0 ? (
                            <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-black uppercase">Nenhuma licitação para acompanhar</td></tr>
                          ) : (
                            tenders.map((tender) => (
                              <tr key={tender.id} className="hover:bg-slate-50/50 group transition-all">
                                <td className="p-8"><p className="font-black text-slate-900 text-base">{tender.numeroEdital}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tender.empresa}</p></td>
                                <td className="p-8">
                                  <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                    tender.statusAtual === TenderStatus.EM_DISPUTA ? 'bg-indigo-600 text-white' : 
                                    tender.statusAtual === TenderStatus.HABILITACAO ? 'bg-emerald-100 text-emerald-700' :
                                    tender.statusAtual === TenderStatus.SUSPENSO ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                  }`}>{tender.statusAtual}</span>
                                  <p className="text-[10px] font-black text-slate-500 uppercase mt-2">{tender.faseAtual}</p>
                                </td>
                                <td className="p-8">
                                  <div className="flex flex-col">
                                    <p className="text-lg font-black text-slate-800">{tender.tipoLote === 'Unico' ? tender.posicaoAtual : `${tender.lotes.length} Itens`}</p>
                                    {tender.statusAtual === TenderStatus.HABILITACAO && <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> Pós-Pregão</span>}
                                  </div>
                                </td>
                                <td className="p-8">{tender.dataRetorno ? <div className="flex items-center gap-3"><CalendarClock className="w-5 h-5 text-amber-500" /><div><p className="text-[11px] font-black text-slate-900">{new Date(tender.dataRetorno).toLocaleDateString('pt-BR')}</p><p className="text-[10px] font-black text-slate-400">{tender.horarioRetorno || '--:--'}</p></div></div> : <span className="text-[10px] font-black text-slate-300 italic uppercase">Não agendado</span>}</td>
                                <td className="p-8 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    {(tender.statusAtual === TenderStatus.AGUARDANDO_DISPUTA || tender.statusAtual === TenderStatus.TRIAGEM) && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleFinalizeDispute(tender); }}
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        title="Concluir Disputa"
                                      >
                                        <Award className="w-5 h-5" />
                                      </button>
                                    )}
                                    <button onClick={() => setManagingTender(tender)} className="px-8 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">Gerenciar <ArrowRightCircle className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                     </table>
                   </div>
                 ) : (
                   <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-in slide-in-from-bottom duration-500">
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> {monthNames[month]} {year}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-xl">Hoje</button>
                          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 border-b border-slate-100">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 flex-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="p-4 border-r border-b border-slate-50 bg-slate-50/10" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const { aberturas, retornos } = getEventsForDay(day);
                          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                          return (
                            <div key={day} className={`p-4 min-h-32 border-r border-b border-slate-100 relative group transition-all hover:bg-slate-50/80 ${isToday ? 'bg-blue-50/30' : ''}`}>
                              <span className={`text-xs font-black ${isToday ? 'text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 shadow-sm shadow-blue-200' : 'text-slate-400'}`}>{day}</span>
                              <div className="mt-3 space-y-2">
                                {aberturas.map((t, idx) => (
                                  <div key={`ab-${idx}`} onClick={() => setManagingTender(t)} className="cursor-pointer flex flex-col p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:scale-105 transition-all">
                                    <div className="flex items-center gap-1.5"><PlayCircle className="w-3 h-3" /> <span className="text-[9px] font-black truncate">{t.numeroEdital}</span></div>
                                    <span className="text-[7px] font-bold uppercase opacity-80 mt-1 truncate">{t.empresa}</span>
                                  </div>
                                ))}
                                {retornos.map((t, idx) => (
                                  <div key={`ret-${idx}`} onClick={() => setManagingTender(t)} className="cursor-pointer flex flex-col p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100 hover:scale-105 transition-all border border-amber-400">
                                    <div className="flex items-center gap-1.5"><Timer className="w-3 h-3" /> <span className="text-[9px] font-black truncate">{t.numeroEdital}</span></div>
                                    <span className="text-[7px] font-bold uppercase opacity-80 mt-1 truncate">Retorno Agendado</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

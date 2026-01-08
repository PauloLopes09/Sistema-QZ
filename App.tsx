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
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {/* ... [Modais omitidos para brevidade] ... */}
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
          {/* Modal de Gestão */}
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
        </header>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-zinc-300">
          <div className="max-w-7xl mx-auto space-y-10">
            {activeMenu === 'dashboard' && <Dashboard tenders={tenders} />}

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
                      
                      {/* NOVOS CAMPOS ADICIONADOS AQUI PARA APARECEREM NA TELA */}
                      <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Prazo para Esclarecimento</label><input type="date" value={formData.prazoEsclarecimento} onChange={(e) => handleInputChange('prazoEsclarecimento', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                      <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Prazo para Impugnação</label><input type="date" value={formData.prazoImpugnacao} onChange={(e) => handleInputChange('prazoImpugnacao', e.target.value)} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                      
                      <DynamicSelect label="Modo de Disputa" value={formData.modoDisputa || ''} onChange={(v) => handleInputChange('modoDisputa', v)} options={listas.modosDisputa} listType="modosDisputa" onAddClick={openModal} />
                      <DynamicSelect label="Responsável" value={formData.responsavel || ''} onChange={(v) => handleInputChange('responsavel', v)} options={listas.responsaveis} listType="responsaveis" onAddClick={openModal} />
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
                      <div className="flex flex-col"><label className="block text-sm font-black text-zinc-700 mb-3 uppercase">Valor Referência (R$)</label><input type="number" value={formData.valorReferencia} onChange={(e) => handleInputChange('valorReferencia', parseFloat(e.target.value))} className="px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold focus:ring-4 focus:ring-violet-50 outline-none" /></div>
                      <div className="flex items-center gap-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mt-8 shadow-sm">
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

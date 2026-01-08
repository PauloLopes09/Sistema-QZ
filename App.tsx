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
import { Tender, TenderStatus, DynamicLists, Lot } from './types';
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

    // Limpa o formulário após salvar
    setFormData({
      empresa: '', orgaoLicitante: '', numeroEdital: '', portal: '', objeto: '',
      statusAtual: TenderStatus.TRIAGEM, tipoLote: 'Unico', lotes: []
    });

    setTimeout(() => {
      setShowSuccess(false);
      setActiveMenu('acompanhamento'); // ID Unificado
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
    const updated = {
      ...tender,
      statusAtual: TenderStatus.HABILITACAO,
      faseAtual: 'Habilitação / Documentação'
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
  const emDisputaCount = tenders.filter(t => t.statusAtual === TenderStatus.EM_DISPUTA).length;

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {/* Modal de Listas Dinâmicas */}
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

      {/* Modal de Gestão Operacional */}
      {managingTender && (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md flex items-center justify-center z-[130] p-6 overflow-y-auto">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center text-white"><Edit3 className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">{managingTender.numeroEdital}</h3>
                  <p className="text-sm font-bold text-violet-600 uppercase">{managingTender.empresa}</p>
                </div>
              </div>
              <button onClick={() => setManagingTender(null)} className="p-4 hover:bg-zinc-200 rounded-full"><X className="w-6 h-6 text-zinc-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 bg-white">
               {/* Conteúdo do Modal aqui... */}
               <p className="text-zinc-500">Editor de licitação ativa.</p>
            </div>
            <div className="p-10 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-4">
              <button onClick={() => setManagingTender(null)} className="px-8 py-4 text-zinc-500 font-black uppercase text-[10px]">Cancelar</button>
              <button onClick={handleUpdateTender} className="px-14 py-4 bg-violet-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col z-50">
        <div className="p-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center"><Zap className="w-7 h-7 text-white" /></div>
          <div><h1 className="text-2xl font-black text-zinc-900">SISTEMA QZ</h1></div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[12px] uppercase ${activeMenu === 'dashboard' ? 'bg-violet-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-zinc-50'}`}><LayoutDashboard className="w-5 h-5" />Resumo Geral</button>
          <button onClick={() => setActiveMenu('cadastro')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[12px] uppercase ${activeMenu === 'cadastro' ? 'bg-violet-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-zinc-50'}`}><FilePlus className="w-5 h-5" />Cadastro de Propostas</button>
          <button onClick={() => setActiveMenu('acompanhamento')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[12px] uppercase ${activeMenu === 'acompanhamento' ? 'bg-violet-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-zinc-50'}`}><ListTodo className="w-5 h-5" />Acompanhamento</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-10 flex items-center justify-between">
          <h2 className="text-2xl font-black text-zinc-900 uppercase">{activeMenu}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {showSuccess && (
              <div className="bg-emerald-500 p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top"><CheckCircle className="w-6 h-6 text-white" /><p className="text-white font-black uppercase text-xs">Sucesso! Processo registrado.</p></div>
            )}

            {activeMenu === 'dashboard' && <Dashboard tenders={tenders} />}

            {activeMenu === 'cadastro' && (
              <div className="bg-white rounded-[48px] border border-zinc-200 p-12 shadow-sm space-y-8">
                <div className="flex gap-2 bg-zinc-50 p-2 rounded-3xl">
                   <button onClick={() => setActiveTab(1)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase ${activeTab === 1 ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400'}`}>Empresa & Órgão</button>
                   <button onClick={() => setActiveTab(2)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase ${activeTab === 2 ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400'}`}>Prazos</button>
                </div>
                {activeTab === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DynamicSelect label="Empresa" value={formData.empresa || ''} onChange={(v) => handleInputChange('empresa', v)} options={listas.empresas} listType="empresas" onAddClick={openModal} required />
                    <div className="flex flex-col"><label className="text-sm font-black mb-2 uppercase">Órgão Licitante</label><input value={formData.orgaoLicitante} onChange={(e) => handleInputChange('orgaoLicitante', e.target.value)} className="px-5 py-3 bg-zinc-50 border rounded-2xl font-bold" /></div>
                    <div className="flex flex-col"><label className="text-sm font-black mb-2 uppercase">Nº Edital</label><input value={formData.numeroEdital} onChange={(e) => handleInputChange('numeroEdital', e.target.value)} className="px-5 py-3 bg-zinc-50 border rounded-2xl font-bold" /></div>
                  </div>
                )}
                <div className="pt-10 border-t flex justify-end">
                  <button onClick={handleSave} className="px-12 py-4 bg-violet-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl flex items-center gap-3"><Save className="w-5 h-5" /> Salvar & Acompanhar</button>
                </div>
              </div>
            )}

            {activeMenu === 'acompanhamento' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="bg-white rounded-[48px] border border-zinc-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b">
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase">Processo</th>
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase">Status</th>
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {tenders.length === 0 ? (
                        <tr><td colSpan={3} className="p-24 text-center text-zinc-300 font-black uppercase">Vazio</td></tr>
                      ) : (
                        tenders.map((tender) => (
                          <tr key={tender.id} className="hover:bg-zinc-50 transition-all">
                            <td className="p-8"><p className="font-black text-zinc-900">{tender.numeroEdital}</p><p className="text-[10px] font-black text-zinc-400 uppercase">{tender.empresa}</p></td>
                            <td className="p-8"><span className="px-3 py-1 bg-zinc-100 rounded-xl text-[9px] font-black uppercase">{tender.statusAtual}</span></td>
                            <td className="p-8"><button onClick={() => setManagingTender(tender)} className="px-6 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase rounded-xl">Gerenciar</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

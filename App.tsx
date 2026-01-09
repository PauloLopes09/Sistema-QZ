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

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<keyof DynamicLists | ''>('');
  const [newItemValue, setNewItemValue] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
    
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
    
  useEffect(() => {
    const savedTenders = localStorage.getItem('qa_tenders');
    if (savedTenders) {
      const parsedTenders: Tender[] = JSON.parse(savedTenders);
      
      const todayISO = new Date().toLocaleDateString('en-CA');
      
      const updatedTenders = parsedTenders.map(t => {
        if ((t as any).retornoQualquerMomento && t.dataRetorno && t.dataRetorno < todayISO) {
          return { ...t, dataRetorno: todayISO };
        }
        return t;
      });

      setTenders(updatedTenders);
    }
    
    const savedLists = localStorage.getItem('qa_lists');
    if (savedLists) setListas(JSON.parse(savedLists));
  }, []);

  useEffect(() => {
    localStorage.setItem('qa_tenders', JSON.stringify(tenders));
  }, [tenders]);

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

  // Lógica de datas segura
  const today = new Date();
  const localToday = today.toLocaleDateString('en-CA'); 

  // Filtros Globais para os Cards e Agenda
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

  const handleSave = () => {
    if (editingId) {
      setTenders(prev => prev.map(t => t.id === editingId ? { ...formData as Tender, id: editingId } : t));
    } else {
      const newTender: Tender = { ...formData as Tender, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), lotes: formData.lotes || [] };
      setTenders(prev => [newTender, ...prev]);
    }
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setActiveMenu('acompanhamento-licitacoes'); setActiveTab(1); setEditingId(null); setFormData(initialFormState); }, 1500);
  };

  const openModal = (type: string) => { setModalType(type as keyof DynamicLists); setNewItemValue(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalType(''); };
  const addItem = () => { if (newItemValue.trim() && modalType) { setListas(prev => ({ ...prev, [modalType]: [...prev[modalType as keyof DynamicLists], newItemValue.trim()] })); closeModal(); } };
  const removeItem = (type: keyof DynamicLists, index: number) => { setListas(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) })); };
  const handleUpdateTender = () => { if (!managingTender) return; setTenders(prev => prev.map(t => t.id === managingTender.id ? managingTender : t)); setManagingTender(null); };
  const deleteTender = (id: string) => { if (confirm('Deseja realmente excluir este processo?')) { setTenders(prev => prev.filter(t => t.id !== id)); } };
  const handleFinalizeDispute = (tender: Tender) => { const nextStatus = TenderStatus.HABILITACAO; const updated = { ...tender, statusAtual: nextStatus, faseAtual: 'Habilitação / Documentação', observacoesPregao: (tender.observacoesPregao || '') + `\n[Log ${new Date().toLocaleDateString()}]: Disputa realizada. Movido para Habilitação.` }; setTenders(prev => prev.map(t => t.id === tender.id ? updated : t)); };
  const updateLot = (lotId: string, field: keyof Lot, value: string) => { if (!managingTender) return; setManagingTender({ ...managingTender, lotes: managingTender.lotes.map(l => l.id === lotId ? { ...l, [field]: value } : l) }); };
  const removeLot = (lotId: string) => { if (!managingTender) return; setManagingTender({ ...managingTender, lotes: managingTender.lotes.filter(l => l.id !== lotId) }); };
  const addLotToManaging = () => { if (!managingTender) return; const newLot: Lot = { id: Math.random().toString(36).substr(2, 5), numero: (managingTender.lotes.length + 1).toString().padStart(2, '0'), colocacao: 'N/A' }; setManagingTender({ ...managingTender, lotes: [...managingTender.lotes, newLot] }); };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {/* ... [Modal de Listas Dinâmicas] ... */}
      {showModal && modalType && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div

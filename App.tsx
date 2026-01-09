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
import { supabase } from './lib/supabaseClient'; // <--- CONEXÃO COM A NUVEM

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<keyof DynamicLists | ''>('');
  const [newItemValue, setNewItemValue] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Novo estado de carregamento
    
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
    
    // Carrega listas locais (essas podem ficar no navegador por enquanto)
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
        // Lógica de Rolagem Automática de Data
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
    
    // Se for novo, gera ID e Data
    if (!editingId) {
       tenderData.id = Math.random().toString(36).substr(2, 9);
       tenderData.createdAt = new Date().toISOString();
       tenderData.lotes = formData.lotes || [];
    }

    try {
      if (editingId) {
        // Atualizar existente
        const { error } = await supabase
          .from('licitacoes')
          .update(tenderData)
          .eq

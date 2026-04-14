import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  Eye,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Robot,
  CaretDown,
  Funnel,
  CurrencyEur,
  EnvelopeSimple,
  Check,
  PaperPlaneTilt,
  Spinner,
  Receipt,
  Money,
  FileText,
  UploadSimple,
  Table as TableIcon,
  Warning
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  'Pendente': 'status-pending',
  'Aprovada': 'status-approved',
  'Rejeitada': 'status-rejected',
  'Lista de Espera': 'status-waitlist'
};

const pagamentoColors = {
  'Por Pagar': 'bg-[#FFF3E0] text-[#E65100]',
  'Pago': 'bg-[#E8F5E9] text-[#2E7D32]',
  'Pago Parcialmente': 'bg-[#FFF8E1] text-[#F9A825]',
  'Recusado p/Mc': 'bg-[#FFEBEE] text-[#C62828]'
};

const CandidaturasPage = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [edicaoFilter, setEdicaoFilter] = useState('all');
  const [pagamentoFilter, setPagamentoFilter] = useState('all');
  const [selectedCandidatura, setSelectedCandidatura] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [edicoes, setEdicoes] = useState([]);
  const [bulkEmailModalOpen, setBulkEmailModalOpen] = useState(false);
  const [pendingEmails, setPendingEmails] = useState({ count: 0, candidaturas: [] });
  const [sendingBulk, setSendingBulk] = useState(false);
  // Payment and billing state
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [faturacaoModalOpen, setFaturacaoModalOpen] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Transferência');
  const [notasPagamento, setNotasPagamento] = useState('');
  const [dadosFaturacao, setDadosFaturacao] = useState({
    nome_fiscal: '',
    nif: '',
    morada_fiscal: '',
    localidade: '',
    codigo_postal: ''
  });
  const [savingPagamento, setSavingPagamento] = useState(false);
  const [savingFaturacao, setSavingFaturacao] = useState(false);
  const [sendingFatura, setSendingFatura] = useState(false);
  
  // Excel import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importApplying, setImportApplying] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCandidaturas();
    fetchCategorias();
    fetchEdicoes();
  }, []);

  const fetchCandidaturas = async () => {
    try {
      const response = await axios.get(`${API}/candidaturas`);
      setCandidaturas(response.data);
    } catch (error) {
      toast.error('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchEdicoes = async () => {
    try {
      const response = await axios.get(`${API}/edicoes`);
      setEdicoes(response.data);
    } catch (error) {
      console.error('Error fetching editions:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API}/categorias`);
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAnalyzeAI = async (id) => {
    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/candidaturas/${id}/analyze`);
      toast.success('Análise IA concluída');
      setSelectedCandidatura(prev => ({ ...prev, ...response.data }));
      fetchCandidaturas();
    } catch (error) {
      toast.error('Erro na análise IA');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API}/candidaturas/${id}/approve`);
      toast.success('Candidatura aprovada!');
      fetchCandidaturas();
      setViewModalOpen(false);
    } catch (error) {
      toast.error('Erro ao aprovar candidatura');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API}/candidaturas/${id}`, { decisao_curadoria: 'Rejeitada', estado_geral: 'Rejeitada' });
      toast.success('Candidatura rejeitada');
      fetchCandidaturas();
      setViewModalOpen(false);
    } catch (error) {
      toast.error('Erro ao rejeitar candidatura');
    }
  };

  const handleWaitlist = async (id) => {
    try {
      await axios.put(`${API}/candidaturas/${id}`, { decisao_curadoria: 'Lista de Espera', estado_geral: 'Em Lista de Espera' });
      toast.success('Candidatura colocada em lista de espera');
      fetchCandidaturas();
      setViewModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar candidatura');
    }
  };

  const handleUpdatePagamento = async (id, novoPagamento) => {
    try {
      await axios.put(`${API}/candidaturas/${id}`, { pagamento: novoPagamento });
      toast.success('Estado de pagamento atualizado');
      fetchCandidaturas();
      // Update selected if viewing
      if (selectedCandidatura?.id === id) {
        setSelectedCandidatura(prev => ({ ...prev, pagamento: novoPagamento }));
      }
    } catch (error) {
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const handleToggleEmailConfirmado = async (id, currentValue) => {
    try {
      await axios.put(`${API}/candidaturas/${id}`, { email_confirmado: !currentValue });
      toast.success(!currentValue ? 'Email marcado como enviado' : 'Email marcado como não enviado');
      fetchCandidaturas();
      if (selectedCandidatura?.id === id) {
        setSelectedCandidatura(prev => ({ ...prev, email_confirmado: !currentValue }));
      }
    } catch (error) {
      toast.error('Erro ao atualizar estado do email');
    }
  };

  const fetchPendingEmails = async () => {
    try {
      const response = await axios.get(`${API}/email/pending-approval`);
      setPendingEmails(response.data);
    } catch (error) {
      console.error('Error fetching pending emails:', error);
    }
  };

  const handleOpenBulkEmailModal = async () => {
    await fetchPendingEmails();
    setBulkEmailModalOpen(true);
  };

  const handleSendBulkEmails = async () => {
    if (pendingEmails.count === 0) {
      toast.info('Não há emails pendentes para enviar');
      return;
    }
    
    setSendingBulk(true);
    try {
      const response = await axios.post(`${API}/email/bulk-send`, { template: 'approval' });
      if (response.data.success) {
        toast.success(`${response.data.sent} emails enviados com sucesso!`);
        if (response.data.failed > 0) {
          toast.warning(`${response.data.failed} emails falharam`);
        }
        fetchCandidaturas();
        setBulkEmailModalOpen(false);
      } else {
        toast.error(response.data.message || 'Erro ao enviar emails');
      }
    } catch (error) {
      toast.error('Erro ao enviar emails em massa');
    } finally {
      setSendingBulk(false);
    }
  };

  // Payment functions
  const handleOpenPagamentoModal = (candidatura) => {
    setSelectedCandidatura(candidatura);
    setValorPagamento('');
    setMetodoPagamento('Transferência');
    setNotasPagamento('');
    setPagamentoModalOpen(true);
  };

  const handleRegistarPagamento = async () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) {
      toast.error('Por favor insira um valor válido');
      return;
    }
    
    setSavingPagamento(true);
    try {
      const response = await axios.post(`${API}/candidaturas/${selectedCandidatura.id}/pagamento`, {
        valor_pago: parseFloat(valorPagamento),
        metodo: metodoPagamento,
        notas: notasPagamento
      });
      toast.success(response.data.message);
      fetchCandidaturas();
      setPagamentoModalOpen(false);
      // Update selected candidatura
      setSelectedCandidatura(prev => ({
        ...prev,
        valor_pago: response.data.valor_pago_total,
        valor_em_falta: response.data.valor_em_falta,
        pagamento: response.data.estado
      }));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao registar pagamento');
    } finally {
      setSavingPagamento(false);
    }
  };

  const handleResetPagamento = async () => {
    setSavingPagamento(true);
    try {
      const response = await axios.put(`${API}/candidaturas/${selectedCandidatura.id}/reset-pagamento`, {
        valor_pago: parseFloat(valorPagamento) || 0
      });
      toast.success(response.data.message);
      fetchCandidaturas();
      setPagamentoModalOpen(false);
      setSelectedCandidatura(prev => ({
        ...prev,
        valor_pago: response.data.valor_pago,
        valor_em_falta: response.data.valor_em_falta,
        pagamento: response.data.estado
      }));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao alterar pagamento');
    } finally {
      setSavingPagamento(false);
    }
  };

  // Billing functions
  const handleOpenFaturacaoModal = (candidatura) => {
    setSelectedCandidatura(candidatura);
    setDadosFaturacao({
      nome_fiscal: candidatura.nome_fiscal || candidatura.nome_marca || '',
      nif: candidatura.nif || '',
      morada_fiscal: candidatura.morada_fiscal || '',
      localidade: candidatura.localidade || '',
      codigo_postal: candidatura.codigo_postal || ''
    });
    setFaturacaoModalOpen(true);
  };

  const handleSaveFaturacao = async () => {
    if (!dadosFaturacao.nif) {
      toast.error('O NIF é obrigatório');
      return;
    }
    
    setSavingFaturacao(true);
    try {
      await axios.put(`${API}/candidaturas/${selectedCandidatura.id}/faturacao`, dadosFaturacao);
      toast.success('Dados de faturação guardados');
      fetchCandidaturas();
      setFaturacaoModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao guardar dados');
    } finally {
      setSavingFaturacao(false);
    }
  };

  const handleEnviarFatura = async (candidatura) => {
    if (!candidatura.nif) {
      toast.error('Preencha os dados de faturação primeiro');
      handleOpenFaturacaoModal(candidatura);
      return;
    }
    
    setSendingFatura(true);
    try {
      const response = await axios.post(`${API}/candidaturas/${candidatura.id}/enviar-fatura`);
      toast.success(response.data.message);
      fetchCandidaturas();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar fatura');
    } finally {
      setSendingFatura(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta candidatura?')) return;
    try {
      await axios.delete(`${API}/candidaturas/${id}`);
      toast.success('Candidatura eliminada');
      fetchCandidaturas();
    } catch (error) {
      toast.error('Erro ao eliminar candidatura');
    }
  };

  const filteredCandidaturas = candidaturas.filter(c => {
    const matchesSearch = c.nome_marca?.toLowerCase().includes(search.toLowerCase()) ||
                         c.responsavel?.toLowerCase().includes(search.toLowerCase()) ||
                         c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.decisao_curadoria === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.categoria === categoryFilter;
    const matchesPagamento = pagamentoFilter === 'all' || c.pagamento === pagamentoFilter;
    
    // Improved edition filter - check both edicao field and opcao_participacao
    let matchesEdicao = edicaoFilter === 'all';
    if (!matchesEdicao) {
      const opcao = c.opcao_participacao?.toLowerCase() || '';
      const edicao = c.edicao?.toLowerCase() || '';
      
      if (edicaoFilter === '12ª Edição') {
        matchesEdicao = (edicao.includes('12') && !edicao.includes('13')) || 
                       (opcao.includes('12') && !opcao.includes('13'));
      } else if (edicaoFilter === '13ª Edição') {
        matchesEdicao = (edicao.includes('13') && !edicao.includes('12')) ||
                       (opcao.includes('13') && !opcao.includes('12'));
      } else if (edicaoFilter === '12ª + 13ª Edição') {
        matchesEdicao = (edicao.includes('12') && edicao.includes('13')) ||
                       (opcao.includes('12') && opcao.includes('13'));
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesEdicao && matchesPagamento;
  });

  // Stats - improved counting based on opcao_participacao
  const countByEdition = (arr, edition) => {
    return arr.filter(c => {
      const opcao = c.opcao_participacao?.toLowerCase() || '';
      const edicao = c.edicao?.toLowerCase() || '';
      
      if (edition === '12') {
        return (edicao.includes('12') && !edicao.includes('13')) || 
               (opcao.includes('12') && !opcao.includes('13'));
      } else if (edition === '13') {
        return (edicao.includes('13') && !edicao.includes('12')) ||
               (opcao.includes('13') && !opcao.includes('12'));
      } else if (edition === 'both') {
        return (edicao.includes('12') && edicao.includes('13')) ||
               (opcao.includes('12') && opcao.includes('13'));
      }
      return false;
    }).length;
  };

  const stats = {
    total: candidaturas.length,
    aprovadas: candidaturas.filter(c => c.decisao_curadoria === 'Aprovada').length,
    pendentes: candidaturas.filter(c => c.decisao_curadoria === 'Pendente').length,
    rejeitadas: candidaturas.filter(c => c.decisao_curadoria === 'Rejeitada').length,
    listaEspera: candidaturas.filter(c => c.decisao_curadoria === 'Lista de Espera').length,
    ed12: countByEdition(candidaturas, '12'),
    ed13: countByEdition(candidaturas, '13'),
    edAmbas: countByEdition(candidaturas, 'both'),
    porPagar: candidaturas.filter(c => c.pagamento === 'Por Pagar').length,
    pagos: candidaturas.filter(c => c.pagamento === 'Pago').length,
    emailEnviado: candidaturas.filter(c => c.email_confirmado === true).length
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Format edition for display
  const formatEdicao = (candidatura) => {
    const opcao = candidatura.opcao_participacao || '';
    const edicao = candidatura.edicao || '';
    
    // Check if both editions
    if ((opcao.includes('12') && opcao.includes('13')) || (edicao.includes('12') && edicao.includes('13'))) {
      return { text: '12ª + 13ª', color: 'bg-[#43523D] text-white' };
    }
    // Check if 12th only
    if (opcao.includes('12') || edicao.includes('12')) {
      return { text: '12ª Ed.', color: 'bg-[#8C3B20] text-white' };
    }
    // Check if 13th only
    if (opcao.includes('13') || edicao.includes('13')) {
      return { text: '13ª Ed.', color: 'bg-[#C98D26] text-white' };
    }
    return { text: '-', color: 'bg-[#F2F2ED] text-[#1A1A1A]' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="candidaturas-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Candidaturas
            </h1>
            <p className="text-[#66665E] mt-1">
              Gestão de candidaturas ao Mercado no Castelo
            </p>
          </div>
          <Button
            onClick={handleOpenBulkEmailModal}
            className="bg-[#43523D] hover:bg-[#506349] text-white"
            data-testid="bulk-email-btn"
          >
            <PaperPlaneTilt size={20} className="mr-2" />
            Enviar Emails em Massa
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.total}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Total</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#43523D]">{stats.aprovadas}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Aprovadas</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#C98D26]">{stats.pendentes}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Pendentes</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#D32F2F]">{stats.rejeitadas}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Rejeitadas</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#E65100]">{stats.porPagar}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Por Pagar</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#2E7D32]">{stats.pagos}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Pagos</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                <Input
                  placeholder="Pesquisar por marca, responsável ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="search-input"
                />
              </div>
              <Select value={edicaoFilter} onValueChange={setEdicaoFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#E5E5DF]" data-testid="edicao-filter">
                  <SelectValue placeholder="Edição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as edições</SelectItem>
                  <SelectItem value="12ª Edição">12ª Edição</SelectItem>
                  <SelectItem value="13ª Edição">13ª Edição</SelectItem>
                  <SelectItem value="12ª + 13ª Edição">12ª + 13ª Edição</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]" data-testid="status-filter">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovada">Aprovada</SelectItem>
                  <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="Lista de Espera">Lista de Espera</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]" data-testid="category-filter">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={pagamentoFilter} onValueChange={setPagamentoFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]" data-testid="pagamento-filter">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Por Pagar">Por Pagar</SelectItem>
                  <SelectItem value="Pago Parcialmente">Pago Parcialmente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Recusado p/Mc">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E5E5DF]">
                    <TableHead className="text-[#66665E] font-semibold">Marca</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Responsável</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Edição</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Estado</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Pagamento</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Faturação</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Email</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCandidaturas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#66665E]">
                        Nenhuma candidatura encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidaturas.map((c) => (
                      <TableRow 
                        key={c.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`candidatura-row-${c.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{c.nome_marca}</TableCell>
                        <TableCell className="text-[#66665E] text-sm">{c.responsavel}</TableCell>
                        <TableCell>
                          {(() => {
                            const ed = formatEdicao(c);
                            return (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ed.color}`}>
                                {ed.text}
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.decisao_curadoria] || 'status-pending'}`}>
                            {c.decisao_curadoria || 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={c.pagamento || 'Por Pagar'} 
                            onValueChange={(value) => handleUpdatePagamento(c.id, value)}
                          >
                            <SelectTrigger className={`w-32 h-7 text-xs border-0 ${pagamentoColors[c.pagamento] || pagamentoColors['Por Pagar']}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Por Pagar">Por Pagar</SelectItem>
                              <SelectItem value="Pago Parcialmente">Parcialmente</SelectItem>
                              <SelectItem value="Pago">Pago</SelectItem>
                              <SelectItem value="Recusado p/Mc">Recusado</SelectItem>
                            </SelectContent>
                          </Select>
                          {c.valor_pago > 0 && (
                            <span className="text-[10px] text-[#66665E] ml-1">
                              {c.valor_pago}€
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenPagamentoModal(c)}
                              className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F2F2ED] text-[#66665E] hover:bg-[#E5E5DF] transition-colors"
                              title="Registar pagamento"
                            >
                              <Money size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenFaturacaoModal(c)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                c.nif ? 'bg-[#43523D] text-white' : 'bg-[#F2F2ED] text-[#66665E] hover:bg-[#E5E5DF]'
                              }`}
                              title={c.nif ? 'Editar faturação' : 'Adicionar faturação'}
                            >
                              <Receipt size={14} />
                            </button>
                            {c.nif && !c.fatura_enviada && (
                              <button
                                onClick={() => handleEnviarFatura(c)}
                                className="w-6 h-6 rounded-full flex items-center justify-center bg-[#8C3B20] text-white hover:bg-[#A14A2E] transition-colors"
                                title="Enviar fatura"
                              >
                                <FileText size={14} />
                              </button>
                            )}
                            {c.fatura_enviada && (
                              <span className="text-[10px] text-[#43523D]">✓</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleToggleEmailConfirmado(c.id, c.email_confirmado)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              c.email_confirmado 
                                ? 'bg-[#43523D] text-white' 
                                : 'bg-[#F2F2ED] text-[#66665E] hover:bg-[#E5E5DF]'
                            }`}
                            title={c.email_confirmado ? 'Email enviado' : 'Email não enviado'}
                          >
                            {c.email_confirmado ? <Check size={14} weight="bold" /> : <EnvelopeSimple size={14} />}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                              onClick={() => { setSelectedCandidatura(c); setViewModalOpen(true); }}
                              data-testid={`view-btn-${c.id}`}
                            >
                              <Eye size={16} className="text-[#66665E]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              onClick={() => handleDelete(c.id)}
                              data-testid={`delete-btn-${c.id}`}
                            >
                              <Trash size={16} className="text-[#D32F2F]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                {selectedCandidatura?.nome_marca}
              </DialogTitle>
            </DialogHeader>

            {selectedCandidatura && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#F2F2ED]">
                  <TabsTrigger value="info" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                    Informação
                  </TabsTrigger>
                  <TabsTrigger value="sustentabilidade" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                    Sustentabilidade
                  </TabsTrigger>
                  <TabsTrigger value="ia" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                    Análise IA
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Responsável</Label>
                      <p className="text-[#1A1A1A] font-medium">{selectedCandidatura.responsavel}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Email</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.email}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Telemóvel</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.telemovel}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Categoria</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.categoria}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Opção de Participação</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.opcao_participacao}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Origem da Produção</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.origem_producao}</p>
                    </div>
                  </div>
                  
                  {/* Payment & Email Status Section */}
                  <div className="bg-[#F2F2ED] rounded-lg p-4 mt-4">
                    <h4 className="text-[#1A1A1A] font-semibold text-sm mb-3">Estado de Pagamento e Comunicação</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#66665E] text-xs uppercase tracking-wider">Pagamento</Label>
                        <Select 
                          value={selectedCandidatura.pagamento || 'Por Pagar'} 
                          onValueChange={(value) => handleUpdatePagamento(selectedCandidatura.id, value)}
                        >
                          <SelectTrigger className={`w-full mt-1 ${pagamentoColors[selectedCandidatura.pagamento] || pagamentoColors['Por Pagar']}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Por Pagar">Por Pagar</SelectItem>
                            <SelectItem value="Pago">Pago</SelectItem>
                            <SelectItem value="Recusado p/Mc">Recusado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[#66665E] text-xs uppercase tracking-wider">Email de Confirmação</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleEmailConfirmado(selectedCandidatura.id, selectedCandidatura.email_confirmado)}
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                              selectedCandidatura.email_confirmado 
                                ? 'bg-[#43523D] text-white' 
                                : 'bg-white border border-[#E5E5DF] text-[#66665E] hover:bg-[#F2F2ED]'
                            }`}
                          >
                            {selectedCandidatura.email_confirmado ? (
                              <>
                                <Check size={16} weight="bold" />
                                Enviado
                              </>
                            ) : (
                              <>
                                <EnvelopeSimple size={16} />
                                Não Enviado
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#66665E] text-xs uppercase tracking-wider">Descrição da Marca</Label>
                    <p className="text-[#1A1A1A] mt-1">{selectedCandidatura.descricao_marca}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Website</Label>
                      <p className="text-[#8C3B20] truncate">{selectedCandidatura.website || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Instagram</Label>
                      <p className="text-[#8C3B20] truncate">{selectedCandidatura.instagram || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Facebook</Label>
                      <p className="text-[#8C3B20] truncate">{selectedCandidatura.facebook || '-'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sustentabilidade" className="mt-4 space-y-4">
                  <div>
                    <Label className="text-[#66665E] text-xs uppercase tracking-wider">Práticas de Sustentabilidade</Label>
                    <p className="text-[#1A1A1A] mt-1">{selectedCandidatura.sustentabilidade_texto || 'Não especificado'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Percentagem de Sustentabilidade</Label>
                      <p className="text-[#1A1A1A] font-medium text-2xl">{selectedCandidatura.sustentabilidade_percentagem || 0}%</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Países de Produção</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.paises_producao || '-'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ia" className="mt-4 space-y-4">
                  <Button
                    onClick={() => handleAnalyzeAI(selectedCandidatura.id)}
                    disabled={analyzing}
                    className="bg-[#43523D] hover:bg-[#506349] text-white"
                    data-testid="analyze-ai-btn"
                  >
                    <Robot size={20} className="mr-2" />
                    {analyzing ? 'A analisar...' : 'Analisar com IA'}
                  </Button>

                  {selectedCandidatura.analise_automatica_ia && (
                    <div className="space-y-4 p-4 bg-[#F2F2ED] rounded-md">
                      <div>
                        <Label className="text-[#66665E] text-xs uppercase tracking-wider">Análise Automática</Label>
                        <p className="text-[#1A1A1A] mt-1">{selectedCandidatura.analise_automatica_ia}</p>
                      </div>
                      <div>
                        <Label className="text-[#66665E] text-xs uppercase tracking-wider">Panorama de Impacto</Label>
                        <p className="text-[#1A1A1A] mt-1">{selectedCandidatura.panorama_geral_impacto}</p>
                      </div>
                      <div>
                        <Label className="text-[#66665E] text-xs uppercase tracking-wider">Recomendação IA</Label>
                        <p className="text-[#1A1A1A] mt-1 font-medium">{selectedCandidatura.recomendacao_ia}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handleWaitlist(selectedCandidatura?.id)}
                className="border-[#E5E5DF] hover:bg-[#F2F2ED]"
                data-testid="waitlist-btn"
              >
                <Clock size={16} className="mr-2" />
                Lista de Espera
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReject(selectedCandidatura?.id)}
                className="border-[#D32F2F] text-[#D32F2F] hover:bg-red-50"
                data-testid="reject-btn"
              >
                <XCircle size={16} className="mr-2" />
                Rejeitar
              </Button>
              <Button
                onClick={() => handleApprove(selectedCandidatura?.id)}
                className="bg-[#43523D] hover:bg-[#506349] text-white"
                data-testid="approve-btn"
              >
                <CheckCircle size={16} className="mr-2" />
                Aprovar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Email Modal */}
        <Dialog open={bulkEmailModalOpen} onOpenChange={setBulkEmailModalOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A] flex items-center gap-2">
                <PaperPlaneTilt size={24} className="text-[#43523D]" />
                Enviar Emails em Massa
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-[#F2F2ED] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#66665E]">Marcas aprovadas sem email enviado:</span>
                  <span className="text-2xl font-semibold text-[#43523D]">{pendingEmails.count}</span>
                </div>
              </div>

              {pendingEmails.count > 0 ? (
                <>
                  <p className="text-[#66665E] text-sm">
                    Esta ação irá enviar um email de confirmação de aprovação para todas as marcas aprovadas que ainda não receberam comunicação.
                  </p>
                  
                  <div className="bg-[#E8F5E9] border border-[#43523D]/20 rounded-lg p-4">
                    <h4 className="font-semibold text-[#43523D] mb-2">O email inclui:</h4>
                    <ul className="text-sm text-[#1A1A1A] space-y-1">
                      <li>• Confirmação de aprovação</li>
                      <li>• Detalhes da opção de participação</li>
                      <li>• Valor a pagar (com IVA)</li>
                      <li>• IBAN para transferência</li>
                      <li>• Próximos passos</li>
                    </ul>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-[#E5E5DF] rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F2F2ED] sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-[#66665E]">Marca</th>
                          <th className="text-left p-2 text-[#66665E]">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingEmails.candidaturas?.slice(0, 10).map((c) => (
                          <tr key={c.id} className="border-t border-[#E5E5DF]">
                            <td className="p-2 text-[#1A1A1A]">{c.nome_marca}</td>
                            <td className="p-2 text-[#66665E] text-xs">{c.email}</td>
                          </tr>
                        ))}
                        {pendingEmails.count > 10 && (
                          <tr className="border-t border-[#E5E5DF]">
                            <td colSpan={2} className="p-2 text-center text-[#66665E] text-xs">
                              ... e mais {pendingEmails.count - 10} marcas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-[#43523D] mx-auto mb-2" />
                  <p className="text-[#1A1A1A] font-medium">Todas as marcas aprovadas já foram notificadas!</p>
                  <p className="text-[#66665E] text-sm">Não há emails pendentes para enviar.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkEmailModalOpen(false)}
                className="border-[#E5E5DF]"
              >
                Cancelar
              </Button>
              {pendingEmails.count > 0 && (
                <Button
                  onClick={handleSendBulkEmails}
                  disabled={sendingBulk}
                  className="bg-[#43523D] hover:bg-[#506349] text-white"
                  data-testid="send-bulk-btn"
                >
                  {sendingBulk ? (
                    <>
                      <Spinner size={16} className="mr-2 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <PaperPlaneTilt size={16} className="mr-2" />
                      Enviar {pendingEmails.count} Emails
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pagamento Modal */}
        <Dialog open={pagamentoModalOpen} onOpenChange={setPagamentoModalOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Money size={24} className="text-[#43523D]" />
                Registar Pagamento
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-[#F2F2ED] rounded-lg p-4">
                <p className="text-sm text-[#66665E]">Marca</p>
                <p className="font-semibold text-[#1A1A1A]">{selectedCandidatura?.nome_marca}</p>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-[#66665E]">Valor Total</p>
                    <p className="font-semibold">{selectedCandidatura?.valor_final?.toFixed(2) || '0.00'}€</p>
                  </div>
                  <div>
                    <p className="text-[#66665E]">Já Pago</p>
                    <p className="font-semibold text-[#43523D]">{selectedCandidatura?.valor_pago?.toFixed(2) || '0.00'}€</p>
                  </div>
                  <div>
                    <p className="text-[#66665E]">Em Falta</p>
                    <p className="font-semibold text-[#E65100]">{(selectedCandidatura?.valor_em_falta || (selectedCandidatura?.valor_final - (selectedCandidatura?.valor_pago || 0)))?.toFixed(2) || '0.00'}€</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#66665E]">Valor do Pagamento (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-[#66665E]">Método</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                    <SelectItem value="MBWay">MBWay</SelectItem>
                    <SelectItem value="Numerário">Numerário</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#66665E]">Notas (opcional)</Label>
                <Input
                  value={notasPagamento}
                  onChange={(e) => setNotasPagamento(e.target.value)}
                  placeholder="Referência, data, etc."
                  className="mt-1"
                />
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 pt-2 border-t border-[#E5E5DF]">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setValorPagamento('0')}
                  className="text-xs border-[#D32F2F] text-[#D32F2F] hover:bg-red-50"
                >
                  Resetar para 0€
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setValorPagamento(String(selectedCandidatura?.valor_final || 0))}
                  className="text-xs border-[#43523D] text-[#43523D] hover:bg-green-50"
                >
                  Marcar como Pago Total
                </Button>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setPagamentoModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleResetPagamento}
                disabled={savingPagamento}
                variant="outline"
                className="border-[#C98D26] text-[#C98D26] hover:bg-amber-50"
              >
                Alterar Valor
              </Button>
              <Button 
                onClick={handleRegistarPagamento}
                disabled={savingPagamento}
                className="bg-[#43523D] hover:bg-[#506349] text-white"
              >
                {savingPagamento ? (
                  <><Spinner size={16} className="mr-2 animate-spin" /> A guardar...</>
                ) : (
                  <><Money size={16} className="mr-2" /> Adicionar Pagamento</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Faturação Modal */}
        <Dialog open={faturacaoModalOpen} onOpenChange={setFaturacaoModalOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Receipt size={24} className="text-[#8C3B20]" />
                Dados de Faturação
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-[#F2F2ED] rounded-lg p-3">
                <p className="font-semibold text-[#1A1A1A]">{selectedCandidatura?.nome_marca}</p>
                <p className="text-sm text-[#66665E]">{selectedCandidatura?.email}</p>
              </div>

              <div>
                <Label className="text-[#66665E]">Nome Fiscal / Empresa *</Label>
                <Input
                  value={dadosFaturacao.nome_fiscal}
                  onChange={(e) => setDadosFaturacao({...dadosFaturacao, nome_fiscal: e.target.value})}
                  placeholder="Nome completo ou empresa"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-[#66665E]">NIF *</Label>
                <Input
                  value={dadosFaturacao.nif}
                  onChange={(e) => setDadosFaturacao({...dadosFaturacao, nif: e.target.value})}
                  placeholder="123456789"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-[#66665E]">Morada</Label>
                <Input
                  value={dadosFaturacao.morada_fiscal}
                  onChange={(e) => setDadosFaturacao({...dadosFaturacao, morada_fiscal: e.target.value})}
                  placeholder="Rua, número, etc."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#66665E]">Localidade</Label>
                  <Input
                    value={dadosFaturacao.localidade}
                    onChange={(e) => setDadosFaturacao({...dadosFaturacao, localidade: e.target.value})}
                    placeholder="Lisboa"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[#66665E]">Código Postal</Label>
                  <Input
                    value={dadosFaturacao.codigo_postal}
                    onChange={(e) => setDadosFaturacao({...dadosFaturacao, codigo_postal: e.target.value})}
                    placeholder="1000-001"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setFaturacaoModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFaturacao}
                disabled={savingFaturacao}
                className="bg-[#43523D] hover:bg-[#506349] text-white"
              >
                {savingFaturacao ? (
                  <><Spinner size={16} className="mr-2 animate-spin" /> A guardar...</>
                ) : (
                  'Guardar'
                )}
              </Button>
              {selectedCandidatura?.nif && !selectedCandidatura?.fatura_enviada && (
                <Button 
                  onClick={() => { setFaturacaoModalOpen(false); handleEnviarFatura(selectedCandidatura); }}
                  disabled={sendingFatura}
                  className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
                >
                  {sendingFatura ? (
                    <><Spinner size={16} className="mr-2 animate-spin" /> A enviar...</>
                  ) : (
                    <><FileText size={16} className="mr-2" /> Enviar Fatura</>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CandidaturasPage;

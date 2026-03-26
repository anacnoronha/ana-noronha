import React, { useState, useEffect } from 'react';
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
  Funnel
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

const CandidaturasPage = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [edicaoFilter, setEdicaoFilter] = useState('all');
  const [selectedCandidatura, setSelectedCandidatura] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [edicoes, setEdicoes] = useState([]);

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
    const matchesEdicao = edicaoFilter === 'all' || c.edicao === edicaoFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesEdicao;
  });

  // Stats
  const stats = {
    total: candidaturas.length,
    aprovadas: candidaturas.filter(c => c.decisao_curadoria === 'Aprovada').length,
    pendentes: candidaturas.filter(c => c.decisao_curadoria === 'Pendente').length,
    rejeitadas: candidaturas.filter(c => c.decisao_curadoria === 'Rejeitada').length,
    listaEspera: candidaturas.filter(c => c.decisao_curadoria === 'Lista de Espera').length,
    ed12: candidaturas.filter(c => c.edicao === '12ª Edição').length,
    ed13: candidaturas.filter(c => c.edicao === '13ª Edição').length
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
            <p className="text-2xl font-semibold text-[#8C3B20]">{stats.listaEspera}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Lista Espera</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.ed12}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">12ª Ed.</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.ed13}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">13ª Ed.</p>
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
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]" data-testid="edicao-filter">
                  <SelectValue placeholder="Edição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as edições</SelectItem>
                  <SelectItem value="12ª Edição">12ª Edição</SelectItem>
                  <SelectItem value="13ª Edição">13ª Edição</SelectItem>
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
                    <TableHead className="text-[#66665E] font-semibold">Categoria</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Edição</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Estado</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCandidaturas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-[#66665E]">
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
                        <TableCell className="text-[#66665E] text-sm">{c.categoria}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F2F2ED] text-[#1A1A1A]">
                            {c.edicao || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.decisao_curadoria] || 'status-pending'}`}>
                            {c.decisao_curadoria || 'Pendente'}
                          </span>
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
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Opção de Participação</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.opcao_participacao}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs uppercase tracking-wider">Origem da Produção</Label>
                      <p className="text-[#1A1A1A]">{selectedCandidatura.origem_producao}</p>
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
      </div>
    </AdminLayout>
  );
};

export default CandidaturasPage;

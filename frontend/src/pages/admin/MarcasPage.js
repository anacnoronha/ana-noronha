import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  MagnifyingGlass, 
  PencilSimple,
  CheckCircle,
  XCircle,
  FileText,
  CurrencyEur,
  Image,
  Upload,
  Eye,
  Link as LinkIcon,
  EnvelopeSimple,
  Receipt,
  Funnel,
  Camera,
  Spinner
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const paymentStatusColors = {
  'Pendente': 'status-pending',
  'Por Pagar': 'bg-[#FFF3E0] text-[#E65100]',
  'Pago Parcialmente': 'bg-[#FFF8E1] text-[#F9A825]',
  'Pago': 'bg-[#E8F5E9] text-[#2E7D32]',
  'Em Atraso': 'status-rejected'
};

const MarcasPage = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edicaoFilter, setEdicaoFilter] = useState('all');
  const [materiaisFilter, setMateriaisFilter] = useState('all');
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingFile, setUploadingFile] = useState(null);
  
  const logotipoRef = useRef(null);
  const fotosRef = useRef(null);
  const contratoRef = useRef(null);

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      const response = await axios.get(`${API}/marcas`);
      setMarcas(response.data);
    } catch (error) {
      toast.error('Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (marca) => {
    setSelectedMarca(marca);
    setFormData({ ...marca });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API}/marcas/${selectedMarca.id}`, formData);
      toast.success('Marca atualizada');
      fetchMarcas();
      setEditModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar marca');
    }
  };

  const handleUploadLogotipo = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedMarca) return;
    
    setUploadingFile('logotipo');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `${API}/upload/logotipo/${selectedMarca.candidatura_id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Logótipo enviado');
      setFormData(prev => ({ ...prev, logotipo_url: response.data.url, logotipo_enviado: true }));
      fetchMarcas();
    } catch (error) {
      toast.error('Erro ao enviar logótipo');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleUploadFotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedMarca) return;
    
    setUploadingFile('fotos');
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      const response = await axios.post(
        `${API}/upload/fotos/${selectedMarca.candidatura_id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(response.data.message);
      setFormData(prev => ({ ...prev, fotos_urls: response.data.urls, fotos_enviadas: true }));
      fetchMarcas();
    } catch (error) {
      toast.error('Erro ao enviar fotos');
    } finally {
      setUploadingFile(null);
    }
  };

  // Get unique editions for filter
  const edicoes = [...new Set(marcas.map(m => {
    if (m.opcao_participacao?.includes('12') && m.opcao_participacao?.includes('13')) return '12ª + 13ª';
    if (m.opcao_participacao?.includes('13')) return '13ª Ed.';
    return '12ª Ed.';
  }))];

  const filteredMarcas = marcas.filter(m => {
    const matchesSearch = 
      m.marca?.toLowerCase().includes(search.toLowerCase()) ||
      m.responsavel?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesEdicao = edicaoFilter === 'all' || (() => {
      if (edicaoFilter === '12ª + 13ª') return m.opcao_participacao?.includes('12') && m.opcao_participacao?.includes('13');
      if (edicaoFilter === '13ª Ed.') return m.opcao_participacao?.includes('13') && !m.opcao_participacao?.includes('12');
      return m.opcao_participacao?.includes('12') && !m.opcao_participacao?.includes('13');
    })();
    
    const matchesMateriais = materiaisFilter === 'all' || 
      (materiaisFilter === 'completos' && m.materiais_completos) ||
      (materiaisFilter === 'incompletos' && !m.materiais_completos);
    
    return matchesSearch && matchesEdicao && matchesMateriais;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  const stats = {
    total: marcas.length,
    materiaisCompletos: marcas.filter(m => m.materiais_completos).length,
    contratosAssinados: marcas.filter(m => m.contrato_assinado).length,
    pagos: marcas.filter(m => m.estado_pagamento === 'Pago').length
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="marcas-page">
        {/* Header */}
        <div>
          <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
            Marcas Aprovadas
          </h1>
          <p className="text-[#66665E] mt-1">
            Gestão de marcas aprovadas, contratos e materiais
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#43523D]">{stats.total}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Total Aprovadas</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#8C3B20]">{stats.materiaisCompletos}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Materiais Completos</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.contratosAssinados}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Contratos Assinados</p>
          </div>
          <div className="bg-white border border-[#E5E5DF] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#2E7D32]">{stats.pagos}</p>
            <p className="text-xs text-[#66665E] uppercase tracking-wider">Pagamentos OK</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                <Input
                  placeholder="Pesquisar por marca, responsável ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#E5E5DF]"
                  data-testid="search-input"
                />
              </div>
              <Select value={edicaoFilter} onValueChange={setEdicaoFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]">
                  <SelectValue placeholder="Edição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Edições</SelectItem>
                  <SelectItem value="12ª Ed.">12ª Edição</SelectItem>
                  <SelectItem value="13ª Ed.">13ª Edição</SelectItem>
                  <SelectItem value="12ª + 13ª">12ª + 13ª</SelectItem>
                </SelectContent>
              </Select>
              <Select value={materiaisFilter} onValueChange={setMateriaisFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]">
                  <SelectValue placeholder="Materiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completos">Completos</SelectItem>
                  <SelectItem value="incompletos">Incompletos</SelectItem>
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
                    <TableHead className="text-[#66665E] font-semibold">Edição</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Valor</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Pagamento</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Contrato</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Materiais</TableHead>
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
                  ) : filteredMarcas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#66665E]">
                        Nenhuma marca encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMarcas.map((m) => (
                      <TableRow 
                        key={m.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`marca-row-${m.id}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">{m.marca}</p>
                            <p className="text-xs text-[#66665E]">{m.responsavel}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.opcao_participacao?.includes('12') && m.opcao_participacao?.includes('13')
                              ? 'bg-[#43523D] text-white'
                              : m.opcao_participacao?.includes('13')
                              ? 'bg-[#8C3B20] text-white'
                              : 'bg-[#1A1A1A] text-white'
                          }`}>
                            {m.opcao_participacao?.includes('12') && m.opcao_participacao?.includes('13')
                              ? '12ª + 13ª'
                              : m.opcao_participacao?.includes('13')
                              ? '13ª Ed.'
                              : '12ª Ed.'}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#1A1A1A] font-medium">
                          {formatCurrency(m.valor_final)}
                          {m.valor_pago > 0 && m.valor_pago < m.valor_final && (
                            <p className="text-xs text-[#43523D]">Pago: {formatCurrency(m.valor_pago)}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[m.estado_pagamento] || 'status-pending'}`}>
                            {m.estado_pagamento || 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {m.contrato_assinado ? (
                              <CheckCircle size={18} className="text-[#43523D]" weight="fill" />
                            ) : m.contrato_gerado ? (
                              <FileText size={18} className="text-[#C98D26]" />
                            ) : (
                              <XCircle size={18} className="text-[#D32F2F]" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={m.logotipo_enviado ? 'text-[#43523D]' : 'text-[#ccc]'} title="Logótipo">
                              <Image size={16} weight={m.logotipo_enviado ? 'fill' : 'regular'} />
                            </span>
                            <span className={m.fotos_enviadas ? 'text-[#43523D]' : 'text-[#ccc]'} title="Fotos">
                              <Camera size={16} weight={m.fotos_enviadas ? 'fill' : 'regular'} />
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {m.email_confirmado ? (
                            <CheckCircle size={18} className="text-[#43523D] mx-auto" weight="fill" />
                          ) : (
                            <EnvelopeSimple size={18} className="text-[#ccc] mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                            onClick={() => handleEdit(m)}
                            data-testid={`edit-btn-${m.id}`}
                          >
                            <Eye size={16} className="text-[#66665E]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                {selectedMarca?.marca}
              </DialogTitle>
            </DialogHeader>

            {/* Hidden file inputs */}
            <input type="file" ref={logotipoRef} onChange={handleUploadLogotipo} accept=".jpg,.jpeg,.png,.gif,.webp" className="hidden" />
            <input type="file" ref={fotosRef} onChange={handleUploadFotos} accept=".jpg,.jpeg,.png,.gif,.webp" multiple className="hidden" />

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#F2F2ED]">
                <TabsTrigger value="info" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                  Info
                </TabsTrigger>
                <TabsTrigger value="materiais" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                  Materiais
                </TabsTrigger>
                <TabsTrigger value="contrato" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
                  Contrato
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#66665E] text-xs">Responsável</Label>
                    <p className="text-[#1A1A1A]">{selectedMarca?.responsavel}</p>
                  </div>
                  <div>
                    <Label className="text-[#66665E] text-xs">Email</Label>
                    <p className="text-[#1A1A1A]">{selectedMarca?.email}</p>
                  </div>
                  <div>
                    <Label className="text-[#66665E] text-xs">Telemóvel</Label>
                    <p className="text-[#1A1A1A]">{selectedMarca?.telemovel}</p>
                  </div>
                  <div>
                    <Label className="text-[#66665E] text-xs">Categoria</Label>
                    <p className="text-[#1A1A1A]">{selectedMarca?.categoria}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[#66665E] text-xs">Opção de Participação</Label>
                    <p className="text-[#1A1A1A]">{selectedMarca?.opcao_participacao}</p>
                  </div>
                </div>

                <div className="bg-[#F2F2ED] rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-[#1A1A1A] mb-3">Pagamento</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#66665E] text-xs">Valor Total</Label>
                      <p className="text-lg font-semibold">{formatCurrency(selectedMarca?.valor_final)}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs">Já Pago</Label>
                      <p className="text-lg font-semibold text-[#43523D]">{formatCurrency(selectedMarca?.valor_pago)}</p>
                    </div>
                    <div>
                      <Label className="text-[#66665E] text-xs">Estado</Label>
                      <Select 
                        value={formData.estado_pagamento || 'Pendente'} 
                        onValueChange={(v) => setFormData({ ...formData, estado_pagamento: v })}
                      >
                        <SelectTrigger className="border-[#E5E5DF] mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Por Pagar">Por Pagar</SelectItem>
                          <SelectItem value="Pago Parcialmente">Parcialmente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Pasta Google Drive</Label>
                  <Input
                    value={formData.pasta_drive || ''}
                    onChange={(e) => setFormData({ ...formData, pasta_drive: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="border-[#E5E5DF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Notas Internas</Label>
                  <Textarea
                    value={formData.notas_internas || ''}
                    onChange={(e) => setFormData({ ...formData, notas_internas: e.target.value })}
                    placeholder="Adicionar notas..."
                    className="border-[#E5E5DF]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="materiais" className="space-y-4 mt-4">
                {/* Logótipo */}
                <div className="border border-[#E5E5DF] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.logotipo_enviado ? 'bg-[#43523D]' : 'bg-[#F2F2ED]'}`}>
                        <Image size={20} className={formData.logotipo_enviado ? 'text-white' : 'text-[#66665E]'} />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1A1A1A]">Logótipo</h4>
                        {formData.logotipo_url ? (
                          <a href={`${process.env.REACT_APP_BACKEND_URL}${formData.logotipo_url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8C3B20] hover:underline">Ver logótipo</a>
                        ) : (
                          <p className="text-xs text-[#66665E]">Não enviado</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => logotipoRef.current?.click()}
                      disabled={uploadingFile === 'logotipo'}
                      variant={formData.logotipo_enviado ? 'outline' : 'default'}
                      className={!formData.logotipo_enviado ? 'bg-[#8C3B20] hover:bg-[#A14A2E]' : ''}
                    >
                      {uploadingFile === 'logotipo' ? <Spinner size={16} className="animate-spin" /> : <Upload size={16} className="mr-2" />}
                      {formData.logotipo_enviado ? 'Substituir' : 'Enviar'}
                    </Button>
                  </div>
                </div>

                {/* Fotos */}
                <div className="border border-[#E5E5DF] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.fotos_enviadas ? 'bg-[#43523D]' : 'bg-[#F2F2ED]'}`}>
                        <Camera size={20} className={formData.fotos_enviadas ? 'text-white' : 'text-[#66665E]'} />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1A1A1A]">Fotos dos Produtos</h4>
                        <p className="text-xs text-[#66665E]">{formData.fotos_urls?.length || 0} foto(s) enviada(s)</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => fotosRef.current?.click()}
                      disabled={uploadingFile === 'fotos'}
                      className="bg-[#8C3B20] hover:bg-[#A14A2E]"
                    >
                      {uploadingFile === 'fotos' ? <Spinner size={16} className="animate-spin" /> : <Upload size={16} className="mr-2" />}
                      Adicionar
                    </Button>
                  </div>
                  {formData.fotos_urls?.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.fotos_urls.map((url, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-[#E5E5DF]">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}${url}`} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comprovativo */}
                <div className="border border-[#E5E5DF] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.comprovativo_pagamento ? 'bg-[#43523D]' : 'bg-[#F2F2ED]'}`}>
                      <Receipt size={20} className={formData.comprovativo_pagamento ? 'text-white' : 'text-[#66665E]'} />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1A1A]">Comprovativo de Pagamento</h4>
                      {formData.comprovativo_pagamento ? (
                        <a href={`${process.env.REACT_APP_BACKEND_URL}${formData.comprovativo_pagamento}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8C3B20] hover:underline">Ver comprovativo</a>
                      ) : (
                        <p className="text-xs text-[#66665E]">Não enviado pela marca</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contrato" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#E5E5DF] rounded-lg">
                    <div>
                      <Label className="text-[#1A1A1A]">Contrato Gerado</Label>
                      <p className="text-xs text-[#66665E]">O contrato foi criado e está pronto para envio</p>
                    </div>
                    <Switch
                      checked={formData.contrato_gerado || false}
                      onCheckedChange={(v) => setFormData({ ...formData, contrato_gerado: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E5E5DF] rounded-lg">
                    <div>
                      <Label className="text-[#1A1A1A]">Contrato Assinado</Label>
                      <p className="text-xs text-[#66665E]">A marca assinou e devolveu o contrato</p>
                    </div>
                    <Switch
                      checked={formData.contrato_assinado || false}
                      onCheckedChange={(v) => setFormData({ ...formData, contrato_assinado: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#1A1A1A]">Link do Contrato (PDF)</Label>
                    <Input
                      value={formData.contrato_url || ''}
                      onChange={(e) => setFormData({ ...formData, contrato_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="border-[#E5E5DF]"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="border-[#E5E5DF]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MarcasPage;

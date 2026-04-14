import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  MagnifyingGlass, 
  PencilSimple,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Armchair,
  Desk,
  Lightning,
  ArrowsClockwise,
  Funnel,
  CurrencyEur
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LogisticaPage = () => {
  const [logistica, setLogistica] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edicaoFilter, setEdicaoFilter] = useState('all');
  const [pagamentoFilter, setPagamentoFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchLogistica();
  }, []);

  const fetchLogistica = async () => {
    try {
      const response = await axios.get(`${API}/logistica`);
      setLogistica(response.data);
    } catch (error) {
      toast.error('Erro ao carregar logística');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await axios.post(`${API}/logistica/sync`);
      toast.success(response.data.message);
      fetchLogistica();
    } catch (error) {
      toast.error('Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API}/logistica/${selectedItem.id}`, formData);
      toast.success('Logística atualizada');
      fetchLogistica();
      setEditModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  // Filter logic
  const filteredLogistica = logistica.filter(l => {
    const matchesSearch = 
      l.marca?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesEdicao = edicaoFilter === 'all' || (() => {
      if (edicaoFilter === '12') return l.edicao?.includes('12') && !l.edicao?.includes('+');
      if (edicaoFilter === '13') return l.edicao?.includes('13') && !l.edicao?.includes('+');
      if (edicaoFilter === 'both') return l.edicao?.includes('+');
      return true;
    })();
    
    const matchesPagamento = pagamentoFilter === 'all' || 
      (pagamentoFilter === 'pago' && l.estado_pagamento === 'Pago') ||
      (pagamentoFilter === 'pendente' && l.estado_pagamento !== 'Pago');
    
    return matchesSearch && matchesEdicao && matchesPagamento;
  });

  // Stats by edition
  const stats = {
    total: logistica.length,
    ed12: logistica.filter(l => l.edicao?.includes('12') && !l.edicao?.includes('+')).length,
    ed13: logistica.filter(l => l.edicao?.includes('13') && !l.edicao?.includes('+')).length,
    edBoth: logistica.filter(l => l.edicao?.includes('+')).length,
    pagos: logistica.filter(l => l.estado_pagamento === 'Pago').length,
    interior: logistica.filter(l => l.zona === 'Interior').length,
    exterior: logistica.filter(l => l.zona === 'Exterior').length,
    mesas: logistica.filter(l => l.necessita_mesa).length,
    cadeiras: logistica.filter(l => l.necessita_cadeira).length
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="logistica-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Logística
            </h1>
            <p className="text-[#66665E] mt-1">
              Gestão de espaços e necessidades das marcas por edição
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="border-[#E5E5DF]"
          >
            <ArrowsClockwise size={18} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Marcas
          </Button>
        </div>

        {/* Stats by Edition */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.total}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#1A1A1A]">{stats.ed12}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">12ª Edição</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#8C3B20]">{stats.ed13}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">13ª Edição</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#43523D]">{stats.edBoth}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">12ª + 13ª</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#2E7D32]">{stats.pagos}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">Pagos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#E5E5DF]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-[#C98D26]">{stats.mesas}</p>
              <p className="text-xs text-[#66665E] uppercase tracking-wider">Mesas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                <Input
                  placeholder="Pesquisar por marca ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#E5E5DF]"
                />
              </div>
              <Select value={edicaoFilter} onValueChange={setEdicaoFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]">
                  <SelectValue placeholder="Edição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Edições</SelectItem>
                  <SelectItem value="12">12ª Edição</SelectItem>
                  <SelectItem value="13">13ª Edição</SelectItem>
                  <SelectItem value="both">12ª + 13ª</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pagamentoFilter} onValueChange={setPagamentoFilter}>
                <SelectTrigger className="w-full md:w-40 border-[#E5E5DF]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pago">Apenas Pagos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs by Edition */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#F2F2ED]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
              Todas ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="12" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
              12ª Ed. ({stats.ed12})
            </TabsTrigger>
            <TabsTrigger value="13" className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white">
              13ª Ed. ({stats.ed13})
            </TabsTrigger>
            <TabsTrigger value="both" className="data-[state=active]:bg-[#43523D] data-[state=active]:text-white">
              12ª + 13ª ({stats.edBoth})
            </TabsTrigger>
          </TabsList>

          {['all', '12', '13', 'both'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="bg-white border border-[#E5E5DF]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#E5E5DF]">
                          <TableHead className="text-[#66665E] font-semibold">Marca</TableHead>
                          <TableHead className="text-[#66665E] font-semibold">Edição</TableHead>
                          <TableHead className="text-[#66665E] font-semibold">Zona</TableHead>
                          <TableHead className="text-[#66665E] font-semibold text-center">Necessidades</TableHead>
                          <TableHead className="text-[#66665E] font-semibold">Pagamento</TableHead>
                          <TableHead className="text-[#66665E] font-semibold">Estado</TableHead>
                          <TableHead className="text-[#66665E] font-semibold text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogistica
                            .filter(l => {
                              if (tab === 'all') return true;
                              if (tab === '12') return l.edicao?.includes('12') && !l.edicao?.includes('+');
                              if (tab === '13') return l.edicao?.includes('13') && !l.edicao?.includes('+');
                              if (tab === 'both') return l.edicao?.includes('+');
                              return true;
                            })
                            .map((l) => (
                              <TableRow 
                                key={l.id} 
                                className={`border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors ${
                                  l.estado_pagamento !== 'Pago' ? 'opacity-60' : ''
                                }`}
                              >
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-[#1A1A1A]">{l.marca}</p>
                                    <p className="text-xs text-[#66665E]">{l.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    l.edicao?.includes('+') ? 'bg-[#43523D] text-white' :
                                    l.edicao?.includes('13') ? 'bg-[#8C3B20] text-white' :
                                    'bg-[#1A1A1A] text-white'
                                  }`}>
                                    {l.edicao?.includes('+') ? '12ª + 13ª' :
                                     l.edicao?.includes('13') ? '13ª Ed.' : '12ª Ed.'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`flex items-center gap-1 text-sm ${
                                    l.zona === 'Interior' ? 'text-[#8C3B20]' : 'text-[#43523D]'
                                  }`}>
                                    <MapPin size={14} />
                                    {l.zona}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className={l.necessita_mesa ? 'text-[#43523D]' : 'text-[#ccc]'} title="Mesa">
                                      <Desk size={18} weight={l.necessita_mesa ? 'fill' : 'regular'} />
                                    </span>
                                    <span className={l.necessita_cadeira ? 'text-[#43523D]' : 'text-[#ccc]'} title="Cadeira">
                                      <Armchair size={18} weight={l.necessita_cadeira ? 'fill' : 'regular'} />
                                    </span>
                                    <span className={l.necessita_eletricidade ? 'text-[#C98D26]' : 'text-[#ccc]'} title="Eletricidade">
                                      <Lightning size={18} weight={l.necessita_eletricidade ? 'fill' : 'regular'} />
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      l.estado_pagamento === 'Pago' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                                      l.estado_pagamento === 'Pago Parcialmente' ? 'bg-[#FFF8E1] text-[#F9A825]' :
                                      'bg-[#FFF3E0] text-[#E65100]'
                                    }`}>
                                      {l.estado_pagamento || 'Por Pagar'}
                                    </span>
                                    <p className="text-xs text-[#66665E] mt-1">
                                      {formatCurrency(l.valor_pago)} / {formatCurrency(l.valor_final)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`flex items-center gap-1 text-xs ${
                                    l.estado === 'Confirmado' ? 'text-[#43523D]' :
                                    l.estado === 'Check-in' ? 'text-[#2E7D32]' :
                                    'text-[#C98D26]'
                                  }`}>
                                    {l.estado === 'Confirmado' ? <CheckCircle size={14} /> :
                                     l.estado === 'Check-in' ? <CheckCircle size={14} weight="fill" /> :
                                     <Clock size={14} />}
                                    {l.estado}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                                    onClick={() => handleEdit(l)}
                                  >
                                    <PencilSimple size={16} className="text-[#66665E]" />
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
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                Editar Logística - {selectedItem?.marca}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Info Summary */}
              <div className="bg-[#F2F2ED] rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#66665E]">Opção de Participação:</span>
                  <span className="text-[#1A1A1A] font-medium text-sm text-right max-w-[200px]">
                    {selectedItem?.opcao_participacao}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66665E]">Valor:</span>
                  <span className="text-[#1A1A1A] font-medium">{formatCurrency(selectedItem?.valor_final)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66665E]">Pago:</span>
                  <span className={`font-medium ${selectedItem?.estado_pagamento === 'Pago' ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
                    {formatCurrency(selectedItem?.valor_pago)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#66665E]">Espaço Atribuído</Label>
                  <Input
                    value={formData.espaco_atribuido || ''}
                    onChange={(e) => setFormData({...formData, espaco_atribuido: e.target.value})}
                    placeholder="Ex: A-12"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[#66665E]">Zona</Label>
                  <Select value={formData.zona || 'Exterior'} onValueChange={(v) => setFormData({...formData, zona: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Exterior">Exterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#66665E]">Hora Montagem</Label>
                  <Input
                    type="time"
                    value={formData.hora_montagem || '08:00'}
                    onChange={(e) => setFormData({...formData, hora_montagem: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[#66665E]">Hora Desmontagem</Label>
                  <Input
                    type="time"
                    value={formData.hora_desmontagem || '20:00'}
                    onChange={(e) => setFormData({...formData, hora_desmontagem: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Needs */}
              <div className="space-y-3">
                <Label className="text-[#1A1A1A]">Necessidades</Label>
                <div className="flex items-center justify-between p-3 border border-[#E5E5DF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Desk size={20} className="text-[#66665E]" />
                    <span>Necessita Mesa</span>
                  </div>
                  <Switch
                    checked={formData.necessita_mesa || false}
                    onCheckedChange={(v) => setFormData({...formData, necessita_mesa: v})}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-[#E5E5DF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Armchair size={20} className="text-[#66665E]" />
                    <span>Necessita Cadeira Adicional</span>
                  </div>
                  <Switch
                    checked={formData.necessita_cadeira || false}
                    onCheckedChange={(v) => setFormData({...formData, necessita_cadeira: v})}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-[#E5E5DF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lightning size={20} className="text-[#C98D26]" />
                    <span>Necessita Eletricidade</span>
                  </div>
                  <Switch
                    checked={formData.necessita_eletricidade || false}
                    onCheckedChange={(v) => setFormData({...formData, necessita_eletricidade: v})}
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#66665E]">Estado</Label>
                <Select value={formData.estado || 'Pendente Pagamento'} onValueChange={(v) => setFormData({...formData, estado: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente Pagamento">Pendente Pagamento</SelectItem>
                    <SelectItem value="Confirmado">Confirmado</SelectItem>
                    <SelectItem value="Check-in">Check-in</SelectItem>
                    <SelectItem value="Check-out">Check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#66665E]">Notas de Montagem</Label>
                <Textarea
                  value={formData.notas_montagem || ''}
                  onChange={(e) => setFormData({...formData, notas_montagem: e.target.value})}
                  placeholder="Observações especiais..."
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white">
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default LogisticaPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple,
  CurrencyEur,
  Buildings,
  Receipt
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
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoriaOptions = ['Parceiro Oficial', 'Patrocinador Premium', 'Patrocinador Gold', 'Patrocinador Silver', 'Media Partner'];

const PatrocinadoresPage = () => {
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    morada: '',
    nif: '',
    valor: 0,
    iva: 0,
    total_fatura: 0,
    data_pagamento: '',
    notas: '',
    categoria: ''
  });

  useEffect(() => {
    fetchPatrocinadores();
  }, []);

  const fetchPatrocinadores = async () => {
    try {
      const response = await axios.get(`${API}/patrocinadores`);
      setPatrocinadores(response.data);
    } catch (error) {
      toast.error('Erro ao carregar patrocinadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setFormData({
      empresa: '',
      morada: '',
      nif: '',
      valor: 0,
      iva: 0,
      total_fatura: 0,
      data_pagamento: '',
      notas: '',
      categoria: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleValorChange = (valor) => {
    const iva = valor * 0.23;
    const total = valor + iva;
    setFormData({ 
      ...formData, 
      valor: valor,
      iva: Math.round(iva * 100) / 100,
      total_fatura: Math.round(total * 100) / 100
    });
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.put(`${API}/patrocinadores/${formData.id}`, formData);
        toast.success('Patrocinador atualizado');
      } else {
        await axios.post(`${API}/patrocinadores`, formData);
        toast.success('Patrocinador criado');
      }
      fetchPatrocinadores();
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const filteredPatrocinadores = patrocinadores.filter(p => 
    p.empresa?.toLowerCase().includes(search.toLowerCase()) ||
    p.nif?.includes(search)
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  // Stats
  const totalReceita = patrocinadores.reduce((acc, p) => acc + (p.total_fatura || 0), 0);
  const totalValor = patrocinadores.reduce((acc, p) => acc + (p.valor || 0), 0);
  const totalIva = patrocinadores.reduce((acc, p) => acc + (p.iva || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="patrocinadores-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Patrocinadores
            </h1>
            <p className="text-[#66665E] mt-1">
              Gestão fiscal e de patrocinadores
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="bg-[#C98D26] hover:bg-[#B57D1F] text-white"
            data-testid="add-patrocinador-btn"
          >
            <Plus size={20} className="mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-[#C98D26] flex items-center justify-center">
                  <Buildings size={24} className="text-white" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold">Total</p>
                  <p className="text-2xl font-['Outfit'] font-semibold text-[#1A1A1A]">{patrocinadores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-2">Valor Base</p>
              <p className="text-2xl font-['Outfit'] font-semibold text-[#1A1A1A]">{formatCurrency(totalValor)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-2">IVA Total</p>
              <p className="text-2xl font-['Outfit'] font-semibold text-[#1A1A1A]">{formatCurrency(totalIva)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-2">Receita Total</p>
              <p className="text-2xl font-['Outfit'] font-semibold text-[#C98D26]">{formatCurrency(totalReceita)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
              <Input
                placeholder="Pesquisar por empresa ou NIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                data-testid="search-input"
              />
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
                    <TableHead className="text-[#66665E] font-semibold">Empresa</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">NIF</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Categoria</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Valor</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">IVA</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Total</TableHead>
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
                  ) : filteredPatrocinadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-[#66665E]">
                        Nenhum patrocinador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatrocinadores.map((p) => (
                      <TableRow 
                        key={p.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`patrocinador-row-${p.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{p.empresa}</TableCell>
                        <TableCell className="text-[#66665E] font-mono text-sm">{p.nif}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#C98D26]/10 text-[#C98D26]">
                            {p.categoria || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#1A1A1A]">{formatCurrency(p.valor)}</TableCell>
                        <TableCell className="text-[#66665E]">{formatCurrency(p.iva)}</TableCell>
                        <TableCell className="text-[#1A1A1A] font-medium">{formatCurrency(p.total_fatura)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                            onClick={() => handleEdit(p)}
                            data-testid={`edit-btn-${p.id}`}
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

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                {editMode ? 'Editar Patrocinador' : 'Novo Patrocinador'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Empresa</Label>
                <Input
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="empresa-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">NIF</Label>
                  <Input
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    placeholder="123456789"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="nif-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Categoria</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="categoria-select">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriaOptions.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Morada</Label>
                <Textarea
                  value={formData.morada}
                  onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                  placeholder="Morada completa"
                  rows={2}
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="morada-textarea"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Valor Base (€)</Label>
                  <Input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => handleValorChange(parseFloat(e.target.value) || 0)}
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="valor-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">IVA (23%)</Label>
                  <Input
                    type="number"
                    value={formData.iva}
                    readOnly
                    className="border-[#E5E5DF] bg-[#F2F2ED]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Total Fatura</Label>
                  <Input
                    type="number"
                    value={formData.total_fatura}
                    readOnly
                    className="border-[#E5E5DF] bg-[#F2F2ED] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Data de Pagamento</Label>
                <Input
                  value={formData.data_pagamento}
                  onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="data-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Notas</Label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Notas adicionais..."
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="notas-textarea"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-[#E5E5DF] hover:bg-[#F2F2ED]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#C98D26] hover:bg-[#B57D1F] text-white"
                data-testid="save-btn"
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

export default PatrocinadoresPage;

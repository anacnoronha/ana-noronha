import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  MagnifyingGlass, 
  PencilSimple,
  CheckCircle,
  XCircle,
  FileText,
  CurrencyEur
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
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const paymentStatusColors = {
  'Pendente': 'status-pending',
  'Pago': 'status-approved',
  'Em Atraso': 'status-rejected'
};

const MarcasPage = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

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

  const filteredMarcas = marcas.filter(m => 
    m.marca?.toLowerCase().includes(search.toLowerCase()) ||
    m.responsavel?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
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
            Gestão de marcas aprovadas e contratos
          </p>
        </div>

        {/* Search */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
              <Input
                placeholder="Pesquisar por marca, responsável ou email..."
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
                    <TableHead className="text-[#66665E] font-semibold">Marca</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Responsável</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Categoria</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Valor</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Pagamento</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Contrato</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Materiais</TableHead>
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
                        Nenhuma marca aprovada encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMarcas.map((m) => (
                      <TableRow 
                        key={m.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`marca-row-${m.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{m.marca}</TableCell>
                        <TableCell className="text-[#66665E]">{m.responsavel}</TableCell>
                        <TableCell className="text-[#66665E]">{m.categoria}</TableCell>
                        <TableCell className="text-[#1A1A1A] font-medium">{formatCurrency(m.valor_final)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[m.estado_pagamento] || 'status-pending'}`}>
                            {m.estado_pagamento || 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {m.contrato_gerado ? (
                              <CheckCircle size={16} className="text-[#43523D]" weight="fill" />
                            ) : (
                              <XCircle size={16} className="text-[#D32F2F]" weight="fill" />
                            )}
                            {m.contrato_assinado ? (
                              <span className="text-xs text-[#43523D]">Assinado</span>
                            ) : (
                              <span className="text-xs text-[#66665E]">Pendente</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {m.materiais_completos ? (
                            <CheckCircle size={16} className="text-[#43523D]" weight="fill" />
                          ) : (
                            <XCircle size={16} className="text-[#D32F2F]" weight="fill" />
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

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                Editar Marca
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Valor Final (€)</Label>
                  <Input
                    type="number"
                    value={formData.valor_final || ''}
                    onChange={(e) => setFormData({ ...formData, valor_final: parseFloat(e.target.value) })}
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="valor-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Estado Pagamento</Label>
                  <Select 
                    value={formData.estado_pagamento || 'Pendente'} 
                    onValueChange={(v) => setFormData({ ...formData, estado_pagamento: v })}
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="pagamento-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Em Atraso">Em Atraso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[#1A1A1A]">Contrato Gerado</Label>
                  <Switch
                    checked={formData.contrato_gerado || false}
                    onCheckedChange={(v) => setFormData({ ...formData, contrato_gerado: v })}
                    data-testid="contrato-gerado-switch"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[#1A1A1A]">Contrato Assinado</Label>
                  <Switch
                    checked={formData.contrato_assinado || false}
                    onCheckedChange={(v) => setFormData({ ...formData, contrato_assinado: v })}
                    data-testid="contrato-assinado-switch"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[#1A1A1A]">Materiais Completos</Label>
                  <Switch
                    checked={formData.materiais_completos || false}
                    onCheckedChange={(v) => setFormData({ ...formData, materiais_completos: v })}
                    data-testid="materiais-switch"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Pasta Drive</Label>
                <Input
                  value={formData.pasta_drive || ''}
                  onChange={(e) => setFormData({ ...formData, pasta_drive: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="drive-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Notas Internas</Label>
                <Textarea
                  value={formData.notas_internas || ''}
                  onChange={(e) => setFormData({ ...formData, notas_internas: e.target.value })}
                  placeholder="Adicionar notas..."
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="notas-textarea"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="border-[#E5E5DF] hover:bg-[#F2F2ED]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
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

export default MarcasPage;

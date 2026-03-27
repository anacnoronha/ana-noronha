import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  PencilSimple, 
  Trash,
  CurrencyEur,
  Check,
  X
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PrecosPage = () => {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPreco, setEditingPreco] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor_base: '',
    iva_percentagem: 23,
    inclui: '',
    edicao: 'Todas',
    ativo: true
  });

  useEffect(() => {
    fetchPrecos();
  }, []);

  const fetchPrecos = async () => {
    try {
      const response = await axios.get(`${API}/precos/all`);
      setPrecos(response.data);
    } catch (error) {
      // If no prices exist, try to seed them
      if (error.response?.status === 404 || (Array.isArray(error.response?.data) && error.response.data.length === 0)) {
        await seedPrecos();
      } else {
        toast.error('Erro ao carregar tabela de preços');
      }
    } finally {
      setLoading(false);
    }
  };

  const seedPrecos = async () => {
    try {
      await axios.post(`${API}/precos/seed`);
      toast.success('Tabela de preços inicializada');
      fetchPrecos();
    } catch (error) {
      console.error('Error seeding prices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        valor_base: parseFloat(formData.valor_base),
        iva_percentagem: parseFloat(formData.iva_percentagem)
      };

      if (editingPreco) {
        await axios.put(`${API}/precos/${editingPreco.id}`, data);
        toast.success('Preço atualizado');
      } else {
        await axios.post(`${API}/precos`, data);
        toast.success('Preço criado');
      }
      
      setModalOpen(false);
      resetForm();
      fetchPrecos();
    } catch (error) {
      toast.error('Erro ao guardar preço');
    }
  };

  const handleEdit = (preco) => {
    setEditingPreco(preco);
    setFormData({
      nome: preco.nome,
      descricao: preco.descricao || '',
      valor_base: preco.valor_base,
      iva_percentagem: preco.iva_percentagem,
      inclui: preco.inclui || '',
      edicao: preco.edicao || 'Todas',
      ativo: preco.ativo
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este preço?')) return;
    try {
      await axios.delete(`${API}/precos/${id}`);
      toast.success('Preço eliminado');
      fetchPrecos();
    } catch (error) {
      toast.error('Erro ao eliminar preço');
    }
  };

  const toggleAtivo = async (preco) => {
    try {
      await axios.put(`${API}/precos/${preco.id}`, { ativo: !preco.ativo });
      toast.success(preco.ativo ? 'Preço desativado' : 'Preço ativado');
      fetchPrecos();
    } catch (error) {
      toast.error('Erro ao atualizar preço');
    }
  };

  const resetForm = () => {
    setEditingPreco(null);
    setFormData({
      nome: '',
      descricao: '',
      valor_base: '',
      iva_percentagem: 23,
      inclui: '',
      edicao: 'Todas',
      ativo: true
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Calculate totals
  const calculateIVA = (valorBase, ivaPerc) => {
    return valorBase * (ivaPerc / 100);
  };

  const calculateTotal = (valorBase, ivaPerc) => {
    return valorBase + calculateIVA(valorBase, ivaPerc);
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="precos-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Tabela de Preços
            </h1>
            <p className="text-[#66665E] mt-1">
              Gestão dos valores de participação no Mercado no Castelo
            </p>
          </div>
          <Button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-[#8C3B20] hover:bg-[#7A3319] text-white"
            data-testid="add-preco-btn"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Preço
          </Button>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20]"></div>
            </div>
          ) : precos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <CurrencyEur size={48} className="mx-auto text-[#66665E] mb-4" />
              <p className="text-[#66665E]">Nenhum preço configurado</p>
              <Button 
                onClick={seedPrecos}
                className="mt-4 bg-[#43523D] hover:bg-[#506349] text-white"
              >
                Inicializar Tabela de Preços
              </Button>
            </div>
          ) : (
            precos.map((preco) => (
              <Card 
                key={preco.id} 
                className={`bg-white border ${preco.ativo ? 'border-[#E5E5DF]' : 'border-red-200 bg-red-50/50'}`}
                data-testid={`preco-card-${preco.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                        {preco.nome}
                      </CardTitle>
                      {!preco.ativo && (
                        <span className="text-xs text-red-600 font-medium">INATIVO</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                        onClick={() => handleEdit(preco)}
                        data-testid={`edit-preco-${preco.id}`}
                      >
                        <PencilSimple size={16} className="text-[#66665E]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => handleDelete(preco.id)}
                        data-testid={`delete-preco-${preco.id}`}
                      >
                        <Trash size={16} className="text-[#D32F2F]" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#66665E] mb-4">{preco.descricao}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#66665E]">Valor Base:</span>
                      <span className="text-[#1A1A1A]">{formatCurrency(preco.valor_base)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#66665E]">IVA ({preco.iva_percentagem}%):</span>
                      <span className="text-[#1A1A1A]">{formatCurrency(preco.valor_iva)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-[#E5E5DF] pt-2">
                      <span className="text-[#1A1A1A]">Total:</span>
                      <span className="text-[#8C3B20]">{formatCurrency(preco.valor_total)}</span>
                    </div>
                  </div>

                  {preco.inclui && (
                    <div className="text-xs text-[#66665E] bg-[#F2F2ED] p-2 rounded">
                      <strong>Inclui:</strong> {preco.inclui}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E5DF]">
                    <span className="text-xs text-[#66665E]">Edição: {preco.edicao}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#66665E]">Ativo</span>
                      <Switch
                        checked={preco.ativo}
                        onCheckedChange={() => toggleAtivo(preco)}
                        data-testid={`toggle-preco-${preco.id}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Table */}
        {precos.length > 0 && (
          <Card className="bg-white border border-[#E5E5DF]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                Resumo de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5DF]">
                      <TableHead className="text-[#66665E] font-semibold">Opção</TableHead>
                      <TableHead className="text-[#66665E] font-semibold text-right">Valor Base</TableHead>
                      <TableHead className="text-[#66665E] font-semibold text-right">IVA</TableHead>
                      <TableHead className="text-[#66665E] font-semibold text-right">Total</TableHead>
                      <TableHead className="text-[#66665E] font-semibold text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {precos.map((preco) => (
                      <TableRow 
                        key={preco.id} 
                        className={`border-b border-[#E5E5DF] ${!preco.ativo ? 'opacity-50' : ''}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{preco.nome}</TableCell>
                        <TableCell className="text-right text-[#66665E]">{formatCurrency(preco.valor_base)}</TableCell>
                        <TableCell className="text-right text-[#66665E]">{formatCurrency(preco.valor_iva)}</TableCell>
                        <TableCell className="text-right font-semibold text-[#8C3B20]">{formatCurrency(preco.valor_total)}</TableCell>
                        <TableCell className="text-center">
                          {preco.ativo ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={12} className="mr-1" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <X size={12} className="mr-1" /> Inativo
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                {editingPreco ? 'Editar Preço' : 'Novo Preço'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#66665E]">Nome da Opção *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Stand Individual"
                  required
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="preco-nome-input"
                />
              </div>

              <div>
                <Label className="text-[#66665E]">Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da opção de participação"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="preco-descricao-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#66665E]">Valor Base (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_base}
                    onChange={(e) => setFormData({ ...formData, valor_base: e.target.value })}
                    placeholder="0.00"
                    required
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="preco-valor-input"
                  />
                </div>
                <div>
                  <Label className="text-[#66665E]">IVA (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.iva_percentagem}
                    onChange={(e) => setFormData({ ...formData, iva_percentagem: e.target.value })}
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="preco-iva-input"
                  />
                </div>
              </div>

              {formData.valor_base && (
                <div className="bg-[#F2F2ED] p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>IVA ({formData.iva_percentagem}%):</span>
                    <span>{formatCurrency(calculateIVA(parseFloat(formData.valor_base) || 0, parseFloat(formData.iva_percentagem) || 23))}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-1">
                    <span>Total:</span>
                    <span className="text-[#8C3B20]">{formatCurrency(calculateTotal(parseFloat(formData.valor_base) || 0, parseFloat(formData.iva_percentagem) || 23))}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-[#66665E]">O que inclui</Label>
                <Textarea
                  value={formData.inclui}
                  onChange={(e) => setFormData({ ...formData, inclui: e.target.value })}
                  placeholder="Mesa, cadeiras, eletricidade..."
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="preco-inclui-input"
                />
              </div>

              <div>
                <Label className="text-[#66665E]">Edição</Label>
                <Input
                  value={formData.edicao}
                  onChange={(e) => setFormData({ ...formData, edicao: e.target.value })}
                  placeholder="Todas ou edição específica"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="preco-edicao-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  data-testid="preco-ativo-switch"
                />
                <Label className="text-[#66665E]">Preço ativo</Label>
              </div>

              <DialogFooter className="gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-[#E5E5DF]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#8C3B20] hover:bg-[#7A3319] text-white"
                  data-testid="save-preco-btn"
                >
                  {editingPreco ? 'Guardar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PrecosPage;

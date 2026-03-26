import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple,
  Leaf,
  CheckCircle,
  XCircle
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
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const grausOptions = ['Alto', 'Médio', 'Baixo', 'Em Avaliação'];

const grauColors = {
  'Alto': 'bg-[#43523D] text-white',
  'Médio': 'bg-[#C98D26] text-white',
  'Baixo': 'bg-[#D32F2F] text-white',
  'Em Avaliação': 'bg-[#F2F2ED] text-[#1A1A1A]'
};

const SustentabilidadePage = () => {
  const [sustentabilidade, setSustentabilidade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    grau_sustentabilidade: '',
    texto: '',
    percentagem: 0,
    verificado: false,
    notas: ''
  });

  useEffect(() => {
    fetchSustentabilidade();
  }, []);

  const fetchSustentabilidade = async () => {
    try {
      const response = await axios.get(`${API}/sustentabilidade`);
      setSustentabilidade(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados de sustentabilidade');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setFormData({
      marca: '',
      grau_sustentabilidade: '',
      texto: '',
      percentagem: 0,
      verificado: false,
      notas: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.put(`${API}/sustentabilidade/${formData.id}`, formData);
        toast.success('Sustentabilidade atualizada');
      } else {
        await axios.post(`${API}/sustentabilidade`, formData);
        toast.success('Sustentabilidade criada');
      }
      fetchSustentabilidade();
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const filteredSustentabilidade = sustentabilidade.filter(s => 
    s.marca?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate averages
  const avgPercentagem = sustentabilidade.length > 0 
    ? sustentabilidade.reduce((acc, s) => acc + (s.percentagem || 0), 0) / sustentabilidade.length 
    : 0;
  const verificados = sustentabilidade.filter(s => s.verificado).length;

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="sustentabilidade-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Sustentabilidade
            </h1>
            <p className="text-[#66665E] mt-1">
              Avaliação e tracking de sustentabilidade das marcas
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="bg-[#43523D] hover:bg-[#506349] text-white"
            data-testid="add-sustentabilidade-btn"
          >
            <Plus size={20} className="mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-[#43523D] flex items-center justify-center">
                  <Leaf size={24} className="text-white" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold">Média Geral</p>
                  <p className="text-2xl font-['Outfit'] font-semibold text-[#1A1A1A]">{avgPercentagem.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={avgPercentagem} className="mt-4 h-2" />
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-2">Total de Marcas</p>
              <p className="text-3xl font-['Outfit'] font-semibold text-[#1A1A1A]">{sustentabilidade.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-2">Verificadas</p>
              <p className="text-3xl font-['Outfit'] font-semibold text-[#43523D]">{verificados}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
              <Input
                placeholder="Pesquisar por marca..."
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
                    <TableHead className="text-[#66665E] font-semibold">Grau</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Percentagem</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Verificado</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSustentabilidade.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-[#66665E]">
                        Nenhum registo de sustentabilidade encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSustentabilidade.map((s) => (
                      <TableRow 
                        key={s.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`sustentabilidade-row-${s.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{s.marca}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${grauColors[s.grau_sustentabilidade] || 'bg-[#F2F2ED]'}`}>
                            {s.grau_sustentabilidade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={s.percentagem || 0} className="w-20 h-2" />
                            <span className="text-[#1A1A1A] font-medium">{s.percentagem || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {s.verificado ? (
                            <CheckCircle size={20} className="text-[#43523D]" weight="fill" />
                          ) : (
                            <XCircle size={20} className="text-[#D32F2F]" weight="fill" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                            onClick={() => handleEdit(s)}
                            data-testid={`edit-btn-${s.id}`}
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
                {editMode ? 'Editar Sustentabilidade' : 'Nova Avaliação'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Marca</Label>
                <Input
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Nome da marca"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="marca-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Grau de Sustentabilidade</Label>
                  <Select 
                    value={formData.grau_sustentabilidade} 
                    onValueChange={(v) => setFormData({ ...formData, grau_sustentabilidade: v })}
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="grau-select">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {grausOptions.map(grau => (
                        <SelectItem key={grau} value={grau}>{grau}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Percentagem (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentagem}
                    onChange={(e) => setFormData({ ...formData, percentagem: parseFloat(e.target.value) || 0 })}
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="percentagem-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Descrição das Práticas</Label>
                <Textarea
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  placeholder="Descrever práticas de sustentabilidade..."
                  rows={3}
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="texto-textarea"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#1A1A1A]">Verificado</Label>
                <Switch
                  checked={formData.verificado}
                  onCheckedChange={(v) => setFormData({ ...formData, verificado: v })}
                  data-testid="verificado-switch"
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
                className="bg-[#43523D] hover:bg-[#506349] text-white"
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

export default SustentabilidadePage;

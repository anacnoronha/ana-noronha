import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple,
  Truck,
  Bed,
  Package
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
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LogisticaPage = () => {
  const [logistica, setLogistica] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    mesa: '',
    cadeiras: '',
    alojamento: '',
    montagem: '',
    desmontagem: '',
    notas: ''
  });

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

  const handleCreate = () => {
    setEditMode(false);
    setFormData({
      marca: '',
      mesa: '',
      cadeiras: '',
      alojamento: '',
      montagem: '',
      desmontagem: '',
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
        await axios.put(`${API}/logistica/${formData.id}`, formData);
        toast.success('Logística atualizada');
      } else {
        await axios.post(`${API}/logistica`, formData);
        toast.success('Logística criada');
      }
      fetchLogistica();
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const filteredLogistica = logistica.filter(l => 
    l.marca?.toLowerCase().includes(search.toLowerCase())
  );

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
              Gestão de mesas, cadeiras, alojamento e montagem
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
            data-testid="add-logistica-btn"
          >
            <Plus size={20} className="mr-2" />
            Adicionar
          </Button>
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
                    <TableHead className="text-[#66665E] font-semibold">Mesa</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Cadeiras</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Alojamento</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Montagem</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Desmontagem</TableHead>
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
                  ) : filteredLogistica.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-[#66665E]">
                        Nenhum registo de logística encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogistica.map((l) => (
                      <TableRow 
                        key={l.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`logistica-row-${l.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{l.marca}</TableCell>
                        <TableCell className="text-[#66665E]">{l.mesa || '-'}</TableCell>
                        <TableCell className="text-[#66665E]">{l.cadeiras || '-'}</TableCell>
                        <TableCell className="text-[#66665E]">{l.alojamento || '-'}</TableCell>
                        <TableCell className="text-[#66665E]">{l.montagem || '-'}</TableCell>
                        <TableCell className="text-[#66665E]">{l.desmontagem || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-[#F2F2ED]"
                            onClick={() => handleEdit(l)}
                            data-testid={`edit-btn-${l.id}`}
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
                {editMode ? 'Editar Logística' : 'Nova Logística'}
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
                  <Label className="text-[#1A1A1A]">Mesa</Label>
                  <Input
                    value={formData.mesa}
                    onChange={(e) => setFormData({ ...formData, mesa: e.target.value })}
                    placeholder="Ex: 1x2m"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="mesa-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Cadeiras</Label>
                  <Input
                    value={formData.cadeiras}
                    onChange={(e) => setFormData({ ...formData, cadeiras: e.target.value })}
                    placeholder="Ex: 2"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="cadeiras-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Alojamento</Label>
                <Input
                  value={formData.alojamento}
                  onChange={(e) => setFormData({ ...formData, alojamento: e.target.value })}
                  placeholder="Necessidades de alojamento"
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="alojamento-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Montagem</Label>
                  <Input
                    value={formData.montagem}
                    onChange={(e) => setFormData({ ...formData, montagem: e.target.value })}
                    placeholder="Horário/data"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="montagem-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Desmontagem</Label>
                  <Input
                    value={formData.desmontagem}
                    onChange={(e) => setFormData({ ...formData, desmontagem: e.target.value })}
                    placeholder="Horário/data"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="desmontagem-input"
                  />
                </div>
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

export default LogisticaPage;

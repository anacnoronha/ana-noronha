import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  EnvelopeSimple,
  CheckCircle,
  XCircle,
  PaperPlaneRight
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

const tiposEmail = [
  'Confirmação de Candidatura',
  'Aprovação',
  'Rejeição',
  'Pedido de Pagamento',
  'Confirmação de Pagamento',
  'Informações do Evento',
  'Lembrete',
  'Pós-Evento',
  'Outro'
];

const ComunicacaoPage = () => {
  const [comunicacoes, setComunicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    tipo_email: '',
    conteudo: '',
    enviado: false
  });

  useEffect(() => {
    fetchComunicacoes();
  }, []);

  const fetchComunicacoes = async () => {
    try {
      const response = await axios.get(`${API}/comunicacao`);
      setComunicacoes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar comunicações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      marca: '',
      tipo_email: '',
      conteudo: '',
      enviado: false
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API}/comunicacao`, formData);
      toast.success('Comunicação registada');
      fetchComunicacoes();
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const filteredComunicacoes = comunicacoes.filter(c => 
    c.marca?.toLowerCase().includes(search.toLowerCase()) ||
    c.tipo_email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="comunicacao-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Comunicação
            </h1>
            <p className="text-[#66665E] mt-1">
              Histórico de emails e comunicações com marcas
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
            data-testid="add-comunicacao-btn"
          >
            <Plus size={20} className="mr-2" />
            Registar Email
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-white border border-[#E5E5DF]">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
              <Input
                placeholder="Pesquisar por marca ou tipo de email..."
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
                    <TableHead className="text-[#66665E] font-semibold">Tipo de Email</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Data</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Conteúdo</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Enviado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredComunicacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-[#66665E]">
                        Nenhuma comunicação registada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComunicacoes.map((c) => (
                      <TableRow 
                        key={c.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`comunicacao-row-${c.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{c.marca}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F2F2ED] text-[#1A1A1A]">
                            {c.tipo_email}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#66665E]">{formatDate(c.data)}</TableCell>
                        <TableCell className="text-[#66665E] max-w-xs truncate">{c.conteudo}</TableCell>
                        <TableCell>
                          {c.enviado ? (
                            <CheckCircle size={20} className="text-[#43523D]" weight="fill" />
                          ) : (
                            <XCircle size={20} className="text-[#D32F2F]" weight="fill" />
                          )}
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
                Registar Email
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

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Tipo de Email</Label>
                <Select 
                  value={formData.tipo_email} 
                  onValueChange={(v) => setFormData({ ...formData, tipo_email: v })}
                >
                  <SelectTrigger className="border-[#E5E5DF]" data-testid="tipo-select">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEmail.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Conteúdo</Label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Resumo do email enviado..."
                  rows={4}
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="conteudo-textarea"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enviado"
                  checked={formData.enviado}
                  onChange={(e) => setFormData({ ...formData, enviado: e.target.checked })}
                  className="rounded border-[#E5E5DF] text-[#8C3B20] focus:ring-[#8C3B20]"
                  data-testid="enviado-checkbox"
                />
                <Label htmlFor="enviado" className="text-[#1A1A1A]">Email já enviado</Label>
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
                <PaperPlaneRight size={16} className="mr-2" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ComunicacaoPage;

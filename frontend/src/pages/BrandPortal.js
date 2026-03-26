import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Slider } from '../components/ui/slider';
import { 
  CastleTurret, 
  SignOut, 
  Plus, 
  FileText, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [opcoesParticipacao, setOpcoesParticipacao] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_marca: '',
    responsavel: user?.name || '',
    email: user?.email || '',
    telemovel: '',
    website: '',
    instagram: '',
    facebook: '',
    categoria: '',
    descricao_marca: '',
    origem_producao: '',
    sustentabilidade_texto: '',
    sustentabilidade_percentagem: 50,
    paises_producao: '',
    participacoes_anteriores: '',
    alojamento: '',
    opcao_participacao: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidaturasRes, categoriasRes] = await Promise.all([
        axios.get(`${API}/candidaturas`),
        axios.get(`${API}/categorias`)
      ]);
      setCandidaturas(candidaturasRes.data);
      setCategorias(categoriasRes.data.categorias);
      setOpcoesParticipacao(categoriasRes.data.opcoes_participacao);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/candidaturas`, formData);
      toast.success('Candidatura submetida com sucesso! A análise IA será feita automaticamente.');
      setModalOpen(false);
      fetchData();
      setFormData({
        nome_marca: '',
        responsavel: user?.name || '',
        email: user?.email || '',
        telemovel: '',
        website: '',
        instagram: '',
        facebook: '',
        categoria: '',
        descricao_marca: '',
        origem_producao: '',
        sustentabilidade_texto: '',
        sustentabilidade_percentagem: 50,
        paises_producao: '',
        participacoes_anteriores: '',
        alojamento: '',
        opcao_participacao: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao submeter candidatura');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Aprovada': return <CheckCircle size={20} weight="fill" className="text-[#43523D]" />;
      case 'Rejeitada': return <XCircle size={20} weight="fill" className="text-[#D32F2F]" />;
      default: return <Clock size={20} weight="fill" className="text-[#C98D26]" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Aprovada': return 'status-approved';
      case 'Rejeitada': return 'status-rejected';
      case 'Lista de Espera': return 'status-waitlist';
      default: return 'status-pending';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="brand-portal">
      {/* Header */}
      <header className="glass-header border-b border-[#E5E5DF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal" className="flex items-center gap-2">
              <CastleTurret size={32} weight="duotone" className="text-[#8C3B20]" />
              <span className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                MNC 2025
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#66665E] hidden sm:block">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-[#F2F2ED]"
                data-testid="logout-btn"
              >
                <SignOut size={20} className="text-[#66665E]" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div 
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(https://images.pexels.com/photos/2573973/pexels-photo-2573973.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-[#1A1A1A]/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-light text-white mb-2">
              Portal da Marca
            </h1>
            <p className="text-white/80 text-lg">
              Bem-vindo(a), {user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A1A1A] mb-4">
                  Nova Candidatura
                </h3>
                <p className="text-[#66665E] text-sm mb-4">
                  Submeta a sua marca para participar no Mercado no Castelo 2025.
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
                  data-testid="new-candidatura-btn"
                >
                  <Plus size={20} className="mr-2" />
                  Submeter Candidatura
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E5E5DF]">
              <CardContent className="p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A1A1A] mb-4">
                  Informações
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-[#43523D] mt-0.5" />
                    <span className="text-[#66665E]">Análise automática por IA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-[#43523D] mt-0.5" />
                    <span className="text-[#66665E]">Curadoria manual especializada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-[#43523D] mt-0.5" />
                    <span className="text-[#66665E]">Resposta em até 7 dias úteis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Candidaturas */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-[#E5E5DF]">
              <CardHeader>
                <CardTitle className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] flex items-center gap-2">
                  <FileText size={24} className="text-[#8C3B20]" />
                  As Minhas Candidaturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20]"></div>
                  </div>
                ) : candidaturas.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="text-[#E5E5DF] mx-auto mb-4" />
                    <p className="text-[#66665E]">Ainda não tem candidaturas submetidas.</p>
                    <p className="text-[#66665E] text-sm mt-2">Clique em "Submeter Candidatura" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candidaturas.map((c) => (
                      <div 
                        key={c.id} 
                        className="p-4 border border-[#E5E5DF] rounded-md hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`candidatura-card-${c.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-md bg-[#8C3B20] flex items-center justify-center text-white font-medium">
                              {c.nome_marca?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-[#1A1A1A]">{c.nome_marca}</h4>
                              <p className="text-sm text-[#66665E]">{c.categoria}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(c.decisao_curadoria)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.decisao_curadoria)}`}>
                              {c.decisao_curadoria || 'Pendente'}
                            </span>
                          </div>
                        </div>
                        
                        {c.analise_automatica_ia && (
                          <div className="mt-4 p-3 bg-[#F2F2ED] rounded-md">
                            <p className="text-xs font-semibold text-[#66665E] uppercase tracking-wider mb-1">Análise IA</p>
                            <p className="text-sm text-[#1A1A1A]">{c.analise_automatica_ia}</p>
                          </div>
                        )}

                        {c.recomendacao_ia && (
                          <div className="mt-2 text-sm">
                            <span className="text-[#66665E]">Recomendação: </span>
                            <span className="text-[#1A1A1A] font-medium">{c.recomendacao_ia}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* New Candidatura Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
              Nova Candidatura
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#66665E] uppercase tracking-wider">Informação da Marca</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[#1A1A1A]">Nome da Marca *</Label>
                  <Input
                    value={formData.nome_marca}
                    onChange={(e) => setFormData({ ...formData, nome_marca: e.target.value })}
                    placeholder="Nome da sua marca"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="nome-marca-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Responsável *</Label>
                  <Input
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="responsavel-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Telemóvel *</Label>
                  <Input
                    value={formData.telemovel}
                    onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                    placeholder="+351 912 345 678"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="telemovel-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                    required
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="categoria-select">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Opção de Participação *</Label>
                  <Select 
                    value={formData.opcao_participacao} 
                    onValueChange={(v) => setFormData({ ...formData, opcao_participacao: v })}
                    required
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="opcao-select">
                      <SelectValue placeholder="Selecionar opção" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesParticipacao.map(op => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Descrição da Marca *</Label>
                <Textarea
                  value={formData.descricao_marca}
                  onChange={(e) => setFormData({ ...formData, descricao_marca: e.target.value })}
                  placeholder="Descreva a sua marca, missão, valores e produtos..."
                  rows={4}
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="descricao-textarea"
                  required
                />
              </div>
            </div>

            {/* Online Presence */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#66665E] uppercase tracking-wider">Presença Online</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="website-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@suamarca"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="instagram-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Facebook</Label>
                  <Input
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="facebook.com/suamarca"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="facebook-input"
                  />
                </div>
              </div>
            </div>

            {/* Production */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#66665E] uppercase tracking-wider">Produção</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Origem da Produção *</Label>
                  <Input
                    value={formData.origem_producao}
                    onChange={(e) => setFormData({ ...formData, origem_producao: e.target.value })}
                    placeholder="Ex: Produção própria em Portugal"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="origem-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Países de Produção</Label>
                  <Input
                    value={formData.paises_producao}
                    onChange={(e) => setFormData({ ...formData, paises_producao: e.target.value })}
                    placeholder="Ex: Portugal, Espanha"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="paises-input"
                  />
                </div>
              </div>
            </div>

            {/* Sustainability */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#66665E] uppercase tracking-wider">Sustentabilidade</h3>
              
              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Práticas de Sustentabilidade</Label>
                <Textarea
                  value={formData.sustentabilidade_texto}
                  onChange={(e) => setFormData({ ...formData, sustentabilidade_texto: e.target.value })}
                  placeholder="Descreva as práticas sustentáveis da sua marca..."
                  rows={3}
                  className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                  data-testid="sustentabilidade-textarea"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1A1A1A]">Nível de Sustentabilidade: {formData.sustentabilidade_percentagem}%</Label>
                <Slider
                  value={[formData.sustentabilidade_percentagem]}
                  onValueChange={(v) => setFormData({ ...formData, sustentabilidade_percentagem: v[0] })}
                  max={100}
                  step={5}
                  className="w-full"
                  data-testid="sustentabilidade-slider"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#66665E] uppercase tracking-wider">Informação Adicional</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Participações Anteriores</Label>
                  <Input
                    value={formData.participacoes_anteriores}
                    onChange={(e) => setFormData({ ...formData, participacoes_anteriores: e.target.value })}
                    placeholder="Ex: MNC 2024, Feira X"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="participacoes-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Necessidade de Alojamento</Label>
                  <Input
                    value={formData.alojamento}
                    onChange={(e) => setFormData({ ...formData, alojamento: e.target.value })}
                    placeholder="Ex: 2 noites para 2 pessoas"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="alojamento-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-[#E5E5DF] hover:bg-[#F2F2ED]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
                data-testid="submit-candidatura-btn"
              >
                {submitting ? 'A submeter...' : 'Submeter Candidatura'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandPortal;

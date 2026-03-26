import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  SignOut, 
  FileText, 
  CheckCircle,
  Clock,
  XCircle,
  CalendarCheck,
  MapPin,
  InstagramLogo,
  ArrowSquareOut
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidaturas, setCandidaturas] = useState([]);
  const [edicoes, setEdicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidaturas');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidaturasRes, edicoesRes] = await Promise.all([
        axios.get(`${API}/candidaturas`),
        axios.get(`${API}/edicoes`)
      ]);
      setCandidaturas(candidaturasRes.data);
      setEdicoes(edicoesRes.data);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="brand-portal">
      {/* Header */}
      <header className="glass-header border-b border-[#E5E5DF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal" className="flex items-center gap-2">
              <img 
                src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png/v1/fill/w_160,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MNC%20LOGO.png" 
                alt="MNC"
                className="h-8"
              />
            </Link>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/mercado_no_castelo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#66665E] hover:text-[#8C3B20] transition-colors"
              >
                <InstagramLogo size={20} weight="bold" />
              </a>
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
        className="relative h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_1904,h_992,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-[#1A1A1A]/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-light text-white mb-2">
              Portal da Marca
            </h1>
            <p className="text-white/80">
              Bem-vindo(a), {user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#F2F2ED] mb-8">
            <TabsTrigger 
              value="candidaturas" 
              className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white"
              data-testid="tab-candidaturas"
            >
              <FileText size={18} className="mr-2" />
              Minhas Candidaturas
            </TabsTrigger>
            <TabsTrigger 
              value="candidatar" 
              className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white"
              data-testid="tab-candidatar"
            >
              <ArrowSquareOut size={18} className="mr-2" />
              Nova Candidatura
            </TabsTrigger>
            <TabsTrigger 
              value="edicoes" 
              className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white"
              data-testid="tab-edicoes"
            >
              <CalendarCheck size={18} className="mr-2" />
              Próximas Edições
            </TabsTrigger>
          </TabsList>

          {/* Candidaturas Tab */}
          <TabsContent value="candidaturas">
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
                    <p className="text-[#66665E] text-sm mt-2">Clique em "Nova Candidatura" para se candidatar.</p>
                    <Button
                      onClick={() => setActiveTab('candidatar')}
                      className="mt-4 bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
                    >
                      Submeter Candidatura
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candidaturas.map((c) => (
                      <div 
                        key={c.id} 
                        className="p-4 border border-[#E5E5DF] rounded-lg hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`candidatura-card-${c.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#8C3B20] flex items-center justify-center text-white font-medium text-lg">
                              {c.nome_marca?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-[#1A1A1A] text-lg">{c.nome_marca}</h4>
                              <p className="text-sm text-[#66665E]">{c.categoria} • {c.opcao_participacao}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(c.decisao_curadoria)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.decisao_curadoria)}`}>
                              {c.decisao_curadoria || 'Pendente'}
                            </span>
                          </div>
                        </div>
                        
                        {c.analise_automatica_ia && (
                          <div className="mt-4 p-3 bg-[#F2F2ED] rounded-md">
                            <p className="text-xs font-semibold text-[#66665E] uppercase tracking-wider mb-1">Análise da Equipa</p>
                            <p className="text-sm text-[#1A1A1A]">{c.analise_automatica_ia}</p>
                          </div>
                        )}

                        {c.recomendacao_ia && (
                          <div className="mt-2 text-sm">
                            <span className="text-[#66665E]">Feedback: </span>
                            <span className="text-[#1A1A1A] font-medium">{c.recomendacao_ia}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nova Candidatura Tab - Google Form Embed */}
          <TabsContent value="candidatar">
            <Card className="bg-white border border-[#E5E5DF]">
              <CardHeader>
                <CardTitle className="font-['Outfit'] text-xl font-medium text-[#1A1A1A]">
                  Submeter Candidatura
                </CardTitle>
                <p className="text-sm text-[#66665E] mt-1">
                  Preencha o formulário abaixo para se candidatar ao Mercado no Castelo. 
                  A sua candidatura será analisada pela nossa equipa de curadoria.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F2F2ED] rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#43523D] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">O que avaliamos nas candidaturas:</p>
                      <ul className="text-sm text-[#66665E] mt-1 space-y-1">
                        <li>• Qualidade e originalidade do projeto</li>
                        <li>• Práticas de sustentabilidade</li>
                        <li>• Produção em condições justas</li>
                        <li>• Adequação ao conceito do mercado</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Google Form Embed */}
                <div className="rounded-lg overflow-hidden border border-[#E5E5DF]">
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeY9YWd0ZHh2rDqR9Z6vL1TrKo9a6/viewform?embedded=true"
                    width="100%" 
                    height="800" 
                    frameBorder="0" 
                    marginHeight="0" 
                    marginWidth="0"
                    title="Formulário de Candidatura"
                    className="bg-white"
                    data-testid="google-form-iframe"
                  >
                    A carregar formulário...
                  </iframe>
                </div>

                <div className="mt-4 p-4 bg-[#F2F2ED] rounded-lg text-center">
                  <p className="text-sm text-[#66665E]">
                    O formulário de candidatura oficial está disponível em:
                  </p>
                  <a 
                    href="https://forms.gle/L1GtV3AY7xTrKo9a6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#8C3B20] text-white rounded-md hover:bg-[#A14A2E] transition-colors"
                  >
                    <ArrowSquareOut size={18} />
                    Abrir Formulário de Candidatura
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Próximas Edições Tab */}
          <TabsContent value="edicoes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {edicoes.length === 0 ? (
                <Card className="bg-white border border-[#E5E5DF] col-span-2">
                  <CardContent className="py-12 text-center">
                    <CalendarCheck size={48} className="text-[#E5E5DF] mx-auto mb-4" />
                    <p className="text-[#66665E]">Ainda não há edições anunciadas.</p>
                  </CardContent>
                </Card>
              ) : (
                edicoes.map((ed) => (
                  <Card key={ed.id} className="bg-white border border-[#E5E5DF] card-hover overflow-hidden">
                    <div 
                      className="h-32 bg-cover bg-center"
                      style={{ backgroundImage: `url(https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_800,h_400,al_c,q_85,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg)` }}
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ed.estado === 'Ativa' ? 'status-approved' : 
                          ed.estado === 'Concluída' ? 'bg-[#F2F2ED] text-[#66665E]' : 
                          'status-pending'
                        }`}>
                          {ed.estado}
                        </span>
                      </div>
                      <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-2">
                        {ed.nome}
                      </h3>
                      <div className="space-y-2 text-sm text-[#66665E]">
                        <div className="flex items-center gap-2">
                          <CalendarCheck size={16} className="text-[#8C3B20]" />
                          <span>{formatDate(ed.data_inicio)} - {formatDate(ed.data_fim)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#8C3B20]" />
                          <span>{ed.local}</span>
                        </div>
                      </div>
                      {ed.notas && (
                        <p className="text-sm text-[#66665E] mt-3 italic">{ed.notas}</p>
                      )}
                      {ed.google_form_url && ed.estado === 'Planeada' && (
                        <Button
                          onClick={() => setActiveTab('candidatar')}
                          className="w-full mt-4 bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
                          data-testid={`candidatar-ed-${ed.id}`}
                        >
                          Candidatar-se a esta edição
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#8C3B20]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-[#8C3B20]" />
              </div>
              <h3 className="font-medium text-[#1A1A1A] mb-2">Curadoria Cuidada</h3>
              <p className="text-sm text-[#66665E]">Cada candidatura é analisada individualmente pela nossa equipa.</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#43523D]/10 flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-[#43523D]" />
              </div>
              <h3 className="font-medium text-[#1A1A1A] mb-2">Resposta em 7 dias</h3>
              <p className="text-sm text-[#66665E]">Receberá uma resposta no prazo de 7 dias úteis.</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#E5E5DF]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C98D26]/10 flex items-center justify-center mx-auto mb-4">
                <InstagramLogo size={24} className="text-[#C98D26]" />
              </div>
              <h3 className="font-medium text-[#1A1A1A] mb-2">Siga-nos</h3>
              <a 
                href="https://www.instagram.com/mercado_no_castelo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#8C3B20] hover:underline"
              >
                @mercado_no_castelo
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[#E5E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#66665E]">
            © 2025 Mercado no Castelo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BrandPortal;

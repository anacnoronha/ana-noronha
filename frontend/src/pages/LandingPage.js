import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  CastleTurret, 
  Storefront, 
  Leaf, 
  CalendarCheck,
  Users,
  ArrowRight,
  MapPin,
  Clock
} from '@phosphor-icons/react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="landing-page">
      {/* Header */}
      <header className="glass-header border-b border-[#E5E5DF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <CastleTurret size={32} weight="duotone" className="text-[#8C3B20]" />
              <span className="font-['Outfit'] text-xl font-semibold text-[#1A1A1A]">
                Mercado no Castelo
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-[#1A1A1A] hover:bg-[#F2F2ED]" data-testid="login-link">
                  Entrar
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white" data-testid="candidatar-btn">
                  Candidatar-se
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section 
        className="relative min-h-[80vh] flex items-center bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://images.pexels.com/photos/2573973/pexels-photo-2573973.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/90 via-[#1A1A1A]/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C98D26] font-semibold mb-4 animate-fade-in">
              Edição 2025
            </p>
            <h1 className="font-['Outfit'] text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 animate-fade-in stagger-1">
              Mercado no<br />
              <span className="font-medium">Castelo</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed animate-fade-in stagger-2">
              O maior mercado de marcas artesanais e sustentáveis de Portugal. 
              Descubra produtos únicos criados por artesãos locais num cenário histórico incomparável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
              <Link to="/login">
                <Button size="lg" className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white rounded-md px-8" data-testid="hero-candidatar-btn">
                  Submeter Candidatura
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-md px-8">
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 bg-white border-b border-[#E5E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-[#F2F2ED] rounded-lg">
              <div className="w-14 h-14 rounded-full bg-[#8C3B20] flex items-center justify-center">
                <CalendarCheck size={28} className="text-white" weight="duotone" />
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold">Data</p>
                <p className="font-['Outfit'] text-xl font-medium text-[#1A1A1A]">15-17 Agosto 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-[#F2F2ED] rounded-lg">
              <div className="w-14 h-14 rounded-full bg-[#43523D] flex items-center justify-center">
                <MapPin size={28} className="text-white" weight="duotone" />
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold">Local</p>
                <p className="font-['Outfit'] text-xl font-medium text-[#1A1A1A]">Castelo de Sintra</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-[#F2F2ED] rounded-lg">
              <div className="w-14 h-14 rounded-full bg-[#C98D26] flex items-center justify-center">
                <Clock size={28} className="text-white" weight="duotone" />
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold">Horário</p>
                <p className="font-['Outfit'] text-xl font-medium text-[#1A1A1A]">10h - 22h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8C3B20] font-semibold mb-4">
              Porquê participar
            </p>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-[#1A1A1A]">
              Uma experiência única
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#8C3B20]/10 flex items-center justify-center mx-auto mb-6">
                  <Storefront size={32} className="text-[#8C3B20]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Visibilidade
                </h3>
                <p className="text-[#66665E]">
                  Exponha a sua marca a milhares de visitantes num dos eventos mais prestigiados de Portugal.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#43523D]/10 flex items-center justify-center mx-auto mb-6">
                  <Leaf size={32} className="text-[#43523D]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Sustentabilidade
                </h3>
                <p className="text-[#66665E]">
                  Faça parte de um movimento que valoriza a produção local e práticas sustentáveis.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C98D26]/10 flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-[#C98D26]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Comunidade
                </h3>
                <p className="text-[#66665E]">
                  Conecte-se com outros artesãos e crie parcerias duradouras no setor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-24 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url(https://images.pexels.com/photos/794556/pexels-photo-794556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)` 
        }}
      >
        <div className="absolute inset-0 bg-[#1A1A1A]/80" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-white mb-6">
            Pronto para fazer parte?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            As candidaturas para a edição 2025 estão abertas. Submeta a sua marca e junte-se a nós nesta experiência única.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white rounded-md px-10" data-testid="cta-candidatar-btn">
              Submeter Candidatura
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <CastleTurret size={28} weight="duotone" className="text-[#8C3B20]" />
              <span className="font-['Outfit'] text-lg font-semibold text-white">
                Mercado no Castelo
              </span>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 Mercado no Castelo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

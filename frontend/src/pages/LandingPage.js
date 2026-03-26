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
  InstagramLogo,
  Sparkle,
  HandHeart,
  Recycle
} from '@phosphor-icons/react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="landing-page">
      {/* Header */}
      <header className="glass-header border-b border-[#E5E5DF] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png/v1/fill/w_160,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MNC%20LOGO.png" 
                alt="Mercado no Castelo"
                className="h-10"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#sobre" className="text-[#1A1A1A] hover:text-[#8C3B20] transition-colors text-sm font-medium">
                Sobre Nós
              </a>
              <a href="#valores" className="text-[#1A1A1A] hover:text-[#8C3B20] transition-colors text-sm font-medium">
                Valores
              </a>
              <a href="https://www.instagram.com/mercado_no_castelo/" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-[#8C3B20] transition-colors">
                <InstagramLogo size={20} weight="bold" />
              </a>
            </nav>
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
        className="relative min-h-[85vh] flex items-center bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_1904,h_992,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg)` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/90 via-[#1A1A1A]/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C98D26] font-semibold mb-4 animate-fade-in">
              Desde 2022 · Norte de Portugal
            </p>
            <h1 className="font-['Outfit'] text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 animate-fade-in stagger-1">
              Mercado no<br />
              <span className="font-medium">Castelo</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed animate-fade-in stagger-2">
              Desafiamos marcas e artistas a juntarem-se num mercado único. 
              Design, empreendedorismo e sustentabilidade num só espaço, 
              focado na compra inteligente – artigos duráveis e produzidos em condições justas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
              <Link to="/login">
                <Button size="lg" className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white rounded-md px-8" data-testid="hero-candidatar-btn">
                  Submeter Candidatura
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <a href="#sobre">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-md px-8">
                  Conhecer o Mercado
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-[#43523D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-white/90 text-xl italic leading-relaxed">
            "Adoramos participar neste mercado pela excelente organização e esforço da equipa 
            e obviamente por serem dos poucos mercados a só terem marcas portuguesas. 
            É um mercado que vale a pena visitar, repleto de empreendedores e bom gosto por todo o lado."
          </blockquote>
          <p className="mt-6 text-[#C98D26] font-medium">
            Ana Nunes · IEMASWIMWEAR
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8C3B20] font-semibold mb-4">
                A Nossa História
              </p>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-[#1A1A1A] mb-6">
                O Mercado no Castelo
              </h2>
              <p className="text-[#66665E] leading-relaxed mb-6">
                O Mercado no Castelo nasceu em 2022, fundado por um grupo de amigas com formações 
                distintas e uma missão comum: criar um espaço onde o design, o empreendedorismo 
                e a sustentabilidade se cruzassem, focado na compra inteligente – artigos duráveis 
                e produzidos em condições justas.
              </p>
              <p className="text-[#66665E] leading-relaxed mb-8">
                Desde então, tornámo-nos numa plataforma de curadoria seletiva, promovendo criadores 
                contemporâneos e projetos sustentáveis em locais históricos e inspiradores. 
                Cada edição é mais do que um evento - é uma celebração da criatividade consciente.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F2ED] rounded-full">
                  <Sparkle size={16} className="text-[#C98D26]" weight="fill" />
                  <span className="text-sm text-[#1A1A1A]">11 Edições</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F2ED] rounded-full">
                  <Storefront size={16} className="text-[#8C3B20]" weight="fill" />
                  <span className="text-sm text-[#1A1A1A]">+100 Marcas</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F2ED] rounded-full">
                  <MapPin size={16} className="text-[#43523D]" weight="fill" />
                  <span className="text-sm text-[#1A1A1A]">Norte de Portugal</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://static.wixstatic.com/media/6e5237_ee885e1dadc943c3aafc57286083d76b~mv2.png/v1/crop/x_0,y_79,w_1080,h_1167/fill/w_395,h_483,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11%C2%AAED_%20MC%20(6).png" 
                alt="Mercado no Castelo"
                className="rounded-lg shadow-lg"
              />
              <img 
                src="https://static.wixstatic.com/media/6e5237_93d626b9d586454eab56b36e34a5b211~mv2.png/v1/crop/x_0,y_161,w_1080,h_1027/fill/w_286,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11%C2%AAED_%20MC%20(3).png" 
                alt="Mercado no Castelo"
                className="rounded-lg shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-[#F2F2ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8C3B20] font-semibold mb-4">
              Categorias
            </p>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-[#1A1A1A]">
              Projetos criteriosamente selecionados
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Moda', icon: '👗' },
              { name: 'Decoração', icon: '🏠' },
              { name: 'Alimentação', icon: '🍯' },
              { name: 'Lifestyle', icon: '✨' }
            ].map((cat) => (
              <Card key={cat.name} className="bg-white border border-[#E5E5DF] card-hover text-center">
                <CardContent className="p-8">
                  <span className="text-4xl mb-4 block">{cat.icon}</span>
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#1A1A1A]">
                    {cat.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="valores" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8C3B20] font-semibold mb-4">
              O que valorizamos
            </p>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-[#1A1A1A]">
              Criatividade consciente
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#8C3B20]/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkle size={32} className="text-[#8C3B20]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Criadores Contemporâneos
                </h3>
                <p className="text-[#66665E]">
                  Apoiamos artistas e empreendedores com projetos de qualidade e design único.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#43523D]/10 flex items-center justify-center mx-auto mb-6">
                  <Recycle size={32} className="text-[#43523D]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Sustentabilidade
                </h3>
                <p className="text-[#66665E]">
                  Focamo-nos na compra inteligente e em artigos duráveis produzidos de forma responsável.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E5E5DF] card-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C98D26]/10 flex items-center justify-center mx-auto mb-6">
                  <HandHeart size={32} className="text-[#C98D26]" weight="duotone" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A1A1A] mb-3">
                  Condições Justas
                </h3>
                <p className="text-[#66665E]">
                  Valorizamos marcas que produzem em condições éticas e justas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Editions Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8C3B20] font-semibold mb-4">
              Edições Anteriores
            </p>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-[#1A1A1A]">
              Locais históricos e inspiradores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_570,h_321,q_90,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg" 
                alt="1.ª Edição - Castelo do Bom Jesus"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-80">1.ª Edição</p>
                <p className="font-medium">Castelo do Bom Jesus, Braga</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://static.wixstatic.com/media/6e5237_c560d018fc35424fa6bcf791466a34ed~mv2.png/v1/fill/w_400,h_400,q_90,enc_avif,quality_auto/6e5237_c560d018fc35424fa6bcf791466a34ed~mv2.png" 
                alt="2.ª Edição - Galerias do Paço"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-80">Edição de Natal</p>
                <p className="font-medium">Galerias do Paço, Braga</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://static.wixstatic.com/media/6e5237_1831a22acd7e4186921ff2fe348f454a~mv2.png/v1/fill/w_400,h_400,q_90,enc_avif,quality_auto/6e5237_1831a22acd7e4186921ff2fe348f454a~mv2.png" 
                alt="3.ª Edição - Serralves"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-80">Serralves em Festa</p>
                <p className="font-medium">Serralves, Porto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-24 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url(https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_1904,h_992,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg)` 
        }}
      >
        <div className="absolute inset-0 bg-[#1A1A1A]/85" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium text-white mb-6">
            Pronto para fazer parte?
          </h2>
          <p className="text-white/80 text-lg mb-4">
            Se é artista, empreendedor e tem um projeto de qualidade com foco na sustentabilidade 
            e produzido em condições justas, candidate-se a fazer parte da nossa aventura!
          </p>
          <p className="text-[#C98D26] text-sm mb-8">
            Candidaturas abertas para próximas edições
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
            <div className="flex items-center gap-4">
              <img 
                src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png/v1/fill/w_160,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MNC%20LOGO.png" 
                alt="Mercado no Castelo"
                className="h-8 brightness-0 invert"
              />
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://www.instagram.com/mercado_no_castelo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <InstagramLogo size={24} weight="bold" />
              </a>
              <a 
                href="https://www.mercadonocastelo.pt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                mercadonocastelo.pt
              </a>
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

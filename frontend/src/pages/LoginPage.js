import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CastleTurret, Envelope, Lock, User, GoogleLogo } from '@phosphor-icons/react';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await login(loginData.email, loginData.password);
      toast.success('Bem-vindo de volta!');
      navigate(userData.role === 'admin' ? '/admin' : '/portal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As passwords não coincidem');
      return;
    }
    setIsLoading(true);
    try {
      await register(registerData.email, registerData.password, registerData.name);
      toast.success('Conta criada com sucesso!');
      navigate('/portal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF7]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png/v1/fill/w_160,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MNC%20LOGO.png" 
                alt="Mercado no Castelo"
                className="h-12"
              />
            </div>
            <p className="text-[#66665E] font-['IBM_Plex_Sans']">
              Plataforma de Gestão
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#F2F2ED]">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white"
                data-testid="login-tab"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-[#8C3B20] data-[state=active]:text-white"
                data-testid="register-tab"
              >
                Registar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-[#1A1A1A]">Email</Label>
                  <div className="relative">
                    <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="login-email-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[#1A1A1A]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="login-password-input"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8C3B20] hover:bg-[#A14A2E] text-white rounded-md"
                  disabled={isLoading}
                  data-testid="login-submit-btn"
                >
                  {isLoading ? 'A entrar...' : 'Entrar'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#E5E5DF]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#FAFAF7] px-2 text-[#66665E]">Ou continuar com</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-[#E5E5DF] hover:bg-[#F2F2ED] text-[#1A1A1A] rounded-md"
                onClick={loginWithGoogle}
                data-testid="google-login-btn"
              >
                <GoogleLogo size={20} weight="bold" className="mr-2" />
                Google
              </Button>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-[#1A1A1A]">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="O seu nome"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="register-name-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-[#1A1A1A]">Email</Label>
                  <div className="relative">
                    <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="register-email-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-[#1A1A1A]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="register-password-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-[#1A1A1A]">Confirmar Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66665E]" size={20} />
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="pl-10 border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                      data-testid="register-confirm-input"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8C3B20] hover:bg-[#A14A2E] text-white rounded-md"
                  disabled={isLoading}
                  data-testid="register-submit-btn"
                >
                  {isLoading ? 'A criar conta...' : 'Criar Conta'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#E5E5DF]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#FAFAF7] px-2 text-[#66665E]">Ou continuar com</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-[#E5E5DF] hover:bg-[#F2F2ED] text-[#1A1A1A] rounded-md"
                onClick={loginWithGoogle}
                data-testid="google-register-btn"
              >
                <GoogleLogo size={20} weight="bold" className="mr-2" />
                Google
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-[#66665E]">
            <Link to="/" className="hover:text-[#8C3B20] transition-colors">
              Voltar à página inicial
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div 
        className="hidden lg:flex flex-1 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url(https://static.wixstatic.com/media/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg/v1/fill/w_1904,h_992,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a5b410_8f56cd12ca8a4e3394f8568ed5e892df~mv2.jpeg)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF7]/20 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 p-6 glass-header rounded-lg">
          <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1A1A1A] mb-2">
            Mercado no Castelo
          </h2>
          <p className="text-[#66665E]">
            Design, empreendedorismo e sustentabilidade num só espaço
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

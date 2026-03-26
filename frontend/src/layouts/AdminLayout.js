import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CastleTurret,
  House,
  FileText,
  Storefront,
  Truck,
  EnvelopeSimple,
  Leaf,
  InstagramLogo,
  CurrencyEur,
  SignOut,
  List,
  X,
  CaretDown,
  User,
  ChartBar
} from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: House },
  { path: '/admin/candidaturas', label: 'Candidaturas', icon: FileText },
  { path: '/admin/marcas', label: 'Marcas Aprovadas', icon: Storefront },
  { path: '/admin/logistica', label: 'Logística', icon: Truck },
  { path: '/admin/comunicacao', label: 'Comunicação', icon: EnvelopeSimple },
  { path: '/admin/sustentabilidade', label: 'Sustentabilidade', icon: Leaf },
  { path: '/admin/socialmedia', label: 'Social Media', icon: InstagramLogo },
  { path: '/admin/patrocinadores', label: 'Patrocinadores', icon: CurrencyEur },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="admin-layout">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-header border-b border-[#E5E5DF] z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-[#F2F2ED] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <img 
                src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png/v1/fill/w_160,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MNC%20LOGO.png" 
                alt="MNC"
                className="h-8"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-[#F2F2ED]"
                  data-testid="user-menu-trigger"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8C3B20] flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <span className="hidden sm:block text-[#1A1A1A] text-sm">{user?.name}</span>
                  <CaretDown size={16} className="text-[#66665E]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-[#E5E5DF]">
                <DropdownMenuItem className="text-[#1A1A1A]" data-testid="user-profile-item">
                  <User size={16} className="mr-2" />
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E5E5DF]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-[#D32F2F] focus:text-[#D32F2F]"
                  data-testid="logout-btn"
                >
                  <SignOut size={16} className="mr-2" />
                  Terminar Sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-[#E5E5DF] transform transition-transform duration-200 ease-in-out z-40 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-testid="admin-sidebar"
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  active
                    ? 'bg-[#8C3B20] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F2F2ED] hover:text-[#1A1A1A]'
                }`}
                data-testid={`nav-${item.path.split('/').pop() || 'dashboard'}`}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="font-['IBM_Plex_Sans'] text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

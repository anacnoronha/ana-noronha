import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  FileText, 
  Storefront, 
  CurrencyEur, 
  Clock, 
  CheckCircle, 
  TrendUp,
  Truck,
  Leaf
} from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
  <Card className={`bg-white border border-[#E5E5DF] card-hover animate-fade-in stagger-${delay}`} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#66665E] font-semibold mb-1">
            {title}
          </p>
          <p className="text-3xl font-['Outfit'] font-semibold text-[#1A1A1A]">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-[#66665E] mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-md flex items-center justify-center ${color}`}>
          <Icon size={24} weight="duotone" className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidaturas, setCandidaturas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, candidaturasRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats`),
          axios.get(`${API}/candidaturas`)
        ]);
        setStats(statsRes.data);
        setCandidaturas(candidaturasRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  // Prepare chart data
  const statusData = candidaturas.reduce((acc, c) => {
    const status = c.decisao_curadoria || 'Pendente';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#C98D26', '#43523D', '#D32F2F', '#8C3B20'];

  const categoryData = candidaturas.reduce((acc, c) => {
    const cat = c.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(categoryData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8C3B20]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="dashboard-page">
        {/* Header */}
        <div>
          <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="text-[#66665E] mt-1">
            Visão geral do Mercado no Castelo 2025
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Candidaturas"
            value={stats?.total_candidaturas || 0}
            subtitle={`${stats?.candidaturas_pendentes || 0} pendentes`}
            icon={FileText}
            color="bg-[#8C3B20]"
            delay={1}
          />
          <StatCard
            title="Marcas Aprovadas"
            value={stats?.total_marcas || 0}
            subtitle={`${stats?.pagamentos_pendentes || 0} pagamentos pendentes`}
            icon={Storefront}
            color="bg-[#43523D]"
            delay={2}
          />
          <StatCard
            title="Patrocinadores"
            value={stats?.total_patrocinadores || 0}
            subtitle={formatCurrency(stats?.receita_patrocinadores)}
            icon={CurrencyEur}
            color="bg-[#C98D26]"
            delay={3}
          />
          <StatCard
            title="Receita Total"
            value={formatCurrency(stats?.receita_total)}
            icon={TrendUp}
            color="bg-[#1A1A1A]"
            delay={4}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidaturas por Status */}
          <Card className="bg-white border border-[#E5E5DF]" data-testid="status-chart">
            <CardHeader>
              <CardTitle className="font-['Outfit'] text-lg font-medium text-[#1A1A1A]">
                Candidaturas por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Candidaturas por Categoria */}
          <Card className="bg-white border border-[#E5E5DF]" data-testid="category-chart">
            <CardHeader>
              <CardTitle className="font-['Outfit'] text-lg font-medium text-[#1A1A1A]">
                Top Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DF" />
                    <XAxis type="number" stroke="#66665E" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#66665E" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8C3B20" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Candidaturas */}
        <Card className="bg-white border border-[#E5E5DF]" data-testid="recent-candidaturas">
          <CardHeader>
            <CardTitle className="font-['Outfit'] text-lg font-medium text-[#1A1A1A]">
              Candidaturas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidaturas.slice(0, 5).map((c, idx) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-4 bg-[#F2F2ED] rounded-md"
                  data-testid={`recent-candidatura-${idx}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-[#8C3B20] flex items-center justify-center text-white font-medium">
                      {c.nome_marca?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{c.nome_marca}</p>
                      <p className="text-sm text-[#66665E]">{c.categoria}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    c.decisao_curadoria === 'Aprovada' ? 'status-approved' :
                    c.decisao_curadoria === 'Rejeitada' ? 'status-rejected' :
                    c.decisao_curadoria === 'Lista de Espera' ? 'status-waitlist' :
                    'status-pending'
                  }`}>
                    {c.decisao_curadoria || 'Pendente'}
                  </div>
                </div>
              ))}
              {candidaturas.length === 0 && (
                <p className="text-center text-[#66665E] py-8">
                  Nenhuma candidatura registada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;

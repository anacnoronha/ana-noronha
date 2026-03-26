import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple,
  InstagramLogo,
  FacebookLogo,
  GoogleLogo,
  Camera,
  FilmStrip
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
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const estadoOptions = ['Pendente', 'Agendado', 'Publicado', 'Em Revisão'];

const estadoColors = {
  'Pendente': 'status-pending',
  'Agendado': 'status-waitlist',
  'Publicado': 'status-approved',
  'Em Revisão': 'bg-[#F2F2ED] text-[#1A1A1A]'
};

const SocialMediaPage = () => {
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    ig_post: '',
    fb_post: '',
    google_business: '',
    story: '',
    reel: '',
    imagem_sugerida: '',
    estado: 'Pendente'
  });

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const response = await axios.get(`${API}/socialmedia`);
      setSocialMedia(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados de social media');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setFormData({
      marca: '',
      ig_post: '',
      fb_post: '',
      google_business: '',
      story: '',
      reel: '',
      imagem_sugerida: '',
      estado: 'Pendente'
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
        await axios.put(`${API}/socialmedia/${formData.id}`, formData);
        toast.success('Social Media atualizado');
      } else {
        await axios.post(`${API}/socialmedia`, formData);
        toast.success('Social Media criado');
      }
      fetchSocialMedia();
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar');
    }
  };

  const filteredSocialMedia = socialMedia.filter(s => 
    s.marca?.toLowerCase().includes(search.toLowerCase())
  );

  const hasContent = (value) => value && value.trim() !== '';

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="socialmedia-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A1A1A]">
              Social Media
            </h1>
            <p className="text-[#66665E] mt-1">
              Tracking de publicações nas redes sociais
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="bg-[#8C3B20] hover:bg-[#A14A2E] text-white"
            data-testid="add-socialmedia-btn"
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
                    <TableHead className="text-[#66665E] font-semibold text-center">IG Post</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">FB Post</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Google</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Story</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-center">Reel</TableHead>
                    <TableHead className="text-[#66665E] font-semibold">Estado</TableHead>
                    <TableHead className="text-[#66665E] font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8C3B20] mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSocialMedia.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#66665E]">
                        Nenhum registo de social media encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSocialMedia.map((s) => (
                      <TableRow 
                        key={s.id} 
                        className="border-b border-[#E5E5DF] hover:bg-[#F2F2ED]/50 transition-colors"
                        data-testid={`socialmedia-row-${s.id}`}
                      >
                        <TableCell className="font-medium text-[#1A1A1A]">{s.marca}</TableCell>
                        <TableCell className="text-center">
                          <InstagramLogo 
                            size={20} 
                            weight={hasContent(s.ig_post) ? 'fill' : 'regular'}
                            className={hasContent(s.ig_post) ? 'text-[#8C3B20] mx-auto' : 'text-[#E5E5DF] mx-auto'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <FacebookLogo 
                            size={20} 
                            weight={hasContent(s.fb_post) ? 'fill' : 'regular'}
                            className={hasContent(s.fb_post) ? 'text-[#8C3B20] mx-auto' : 'text-[#E5E5DF] mx-auto'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <GoogleLogo 
                            size={20} 
                            weight={hasContent(s.google_business) ? 'fill' : 'regular'}
                            className={hasContent(s.google_business) ? 'text-[#8C3B20] mx-auto' : 'text-[#E5E5DF] mx-auto'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Camera 
                            size={20} 
                            weight={hasContent(s.story) ? 'fill' : 'regular'}
                            className={hasContent(s.story) ? 'text-[#8C3B20] mx-auto' : 'text-[#E5E5DF] mx-auto'}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <FilmStrip 
                            size={20} 
                            weight={hasContent(s.reel) ? 'fill' : 'regular'}
                            className={hasContent(s.reel) ? 'text-[#8C3B20] mx-auto' : 'text-[#E5E5DF] mx-auto'}
                          />
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[s.estado] || 'status-pending'}`}>
                            {s.estado}
                          </span>
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
                {editMode ? 'Editar Social Media' : 'Novo Registo'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-[#1A1A1A]">Estado</Label>
                  <Select 
                    value={formData.estado} 
                    onValueChange={(v) => setFormData({ ...formData, estado: v })}
                  >
                    <SelectTrigger className="border-[#E5E5DF]" data-testid="estado-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map(estado => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Instagram Post</Label>
                  <Input
                    value={formData.ig_post}
                    onChange={(e) => setFormData({ ...formData, ig_post: e.target.value })}
                    placeholder="Link ou status"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="ig-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Facebook Post</Label>
                  <Input
                    value={formData.fb_post}
                    onChange={(e) => setFormData({ ...formData, fb_post: e.target.value })}
                    placeholder="Link ou status"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="fb-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Google Business</Label>
                  <Input
                    value={formData.google_business}
                    onChange={(e) => setFormData({ ...formData, google_business: e.target.value })}
                    placeholder="Link ou status"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="google-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Story</Label>
                  <Input
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    placeholder="Link ou status"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="story-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Reel</Label>
                  <Input
                    value={formData.reel}
                    onChange={(e) => setFormData({ ...formData, reel: e.target.value })}
                    placeholder="Link ou status"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="reel-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1A1A1A]">Imagem Sugerida</Label>
                  <Input
                    value={formData.imagem_sugerida}
                    onChange={(e) => setFormData({ ...formData, imagem_sugerida: e.target.value })}
                    placeholder="URL da imagem"
                    className="border-[#E5E5DF] focus:ring-2 focus:ring-[#8C3B20]/20 focus:border-[#8C3B20]"
                    data-testid="imagem-input"
                  />
                </div>
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

export default SocialMediaPage;

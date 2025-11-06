

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Play, 
  MoreHorizontal,
  Calendar,
  Users,
  TrendingUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  type: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  creditsUsed: number;
  estimatedCost: number;
  scheduledAt: string | null;
  createdAt: string;
  contactList: {
    id: string;
    name: string;
    totalContacts: number;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function CampaignsTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, [search, statusFilter, pagination.page]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/dashboard/campaigns?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
        setPagination(data.pagination);
      } else {
        throw new Error('Error al cargar campañas');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las campañas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      SCHEDULED: { label: 'Programada', className: 'bg-blue-100 text-blue-800' },
      SENDING: { label: 'Enviando', className: 'bg-yellow-100 text-yellow-800' },
      SENT: { label: 'Enviada', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Completada', className: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Fallida', className: 'bg-red-100 text-red-800' },
      PAUSED: { label: 'Pausada', className: 'bg-orange-100 text-orange-800' },
      CANCELED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSuccessRate = (campaign: Campaign) => {
    if (campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.deliveredCount / campaign.totalRecipients) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando campañas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campañas</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => ['SCHEDULED', 'SENDING'].includes(c.status)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enviados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.length > 0 ? 
                    Math.round(campaigns.reduce((sum, c) => sum + getSuccessRate(c), 0) / campaigns.length) : 0
                  }%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              Lista de Campañas
            </CardTitle>
            <Link href="/dashboard/campaigns/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Campaña
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar campañas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="SCHEDULED">Programada</SelectItem>
                <SelectItem value="SENDING">Enviando</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="FAILED">Fallida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay campañas
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primera campaña de SMS.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/campaigns/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Campaña
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Audiencia</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.message}
                          </div>
                          {campaign.template && (
                            <div className="text-xs text-blue-600">
                              Plantilla: {campaign.template.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(campaign.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {campaign.totalRecipients.toLocaleString()} contactos
                          </div>
                          <div className="text-gray-500">
                            {campaign.contactList ? campaign.contactList.name : 'Todos los contactos'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Enviados</span>
                            <span>{campaign.sentCount}/{campaign.totalRecipients}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${campaign.totalRecipients > 0 ? (campaign.sentCount / campaign.totalRecipients) * 100 : 0}%`
                              }}
                            ></div>
                          </div>
                          {campaign.deliveredCount > 0 && (
                            <div className="text-xs text-green-600">
                              {getSuccessRate(campaign)}% tasa de éxito
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {campaign.scheduledAt ? 
                              'Programada para ' + formatDistanceToNow(new Date(campaign.scheduledAt), { addSuffix: true, locale: es }) :
                              formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true, locale: es })
                            }
                          </div>
                          <div className="text-gray-500">
                            Por {campaign.createdBy.firstName} {campaign.createdBy.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/dashboard/campaigns/${campaign.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {['DRAFT', 'SCHEDULED'].includes(campaign.status) && (
                            <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {campaign.status === 'DRAFT' && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} campañas
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Edit,
  Calendar,
  CreditCard,
  Eye,
  Phone,
  FileText
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  type: string;
  targetType: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  creditsUsed: number;
  estimatedCost: number;
  actualCost: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  timezone: string;
  contactList: {
    id: string;
    name: string;
    totalContacts: number;
    validContacts: number;
  } | null;
  template: {
    id: string;
    name: string;
    content: string;
    variables: string[];
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    id: string;
    name: string;
    credits: number;
  };
  messages: Array<{
    id: string;
    status: string;
    phone: string;
    sentAt: string | null;
    deliveredAt: string | null;
    failReason: string | null;
    creditsUsed: number;
  }>;
}

interface CampaignDetailsViewProps {
  campaignId: string;
}

export function CampaignDetailsView({ campaignId }: CampaignDetailsViewProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingLoading, setSendingLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
      } else {
        throw new Error('Campaña no encontrada');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la campaña',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaign) return;
    
    setSendingLoading(true);
    try {
      const response = await fetch(`/api/dashboard/campaigns/${campaignId}/send`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Campaña enviada',
          description: 'La campaña se está enviando a los contactos',
        });
        
        // Refresh campaign data
        setTimeout(fetchCampaign, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar la campaña');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', className: 'bg-gray-100 text-gray-800', icon: FileText },
      SCHEDULED: { label: 'Programada', className: 'bg-blue-100 text-blue-800', icon: Calendar },
      SENDING: { label: 'Enviando', className: 'bg-yellow-100 text-yellow-800', icon: Send },
      SENT: { label: 'Enviada', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      COMPLETED: { label: 'Completada', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { label: 'Fallida', className: 'bg-red-100 text-red-800', icon: XCircle },
      PAUSED: { label: 'Pausada', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      CANCELED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: AlertCircle
    };

    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getMessageStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', className: 'bg-gray-100 text-gray-800' },
      SENT: { label: 'Enviado', className: 'bg-blue-100 text-blue-800' },
      DELIVERED: { label: 'Entregado', className: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Fallido', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  };

  const getSuccessRate = () => {
    if (!campaign || campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.deliveredCount / campaign.totalRecipients) * 100);
  };

  const getDeliveryRate = () => {
    if (!campaign || campaign.sentCount === 0) return 0;
    return Math.round((campaign.deliveredCount / campaign.sentCount) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaña no encontrada</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="mt-2 text-gray-600">
              Creada {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true, locale: es })} 
              por {campaign.createdBy.firstName} {campaign.createdBy.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(campaign.status)}
          
          {campaign.status === 'DRAFT' && (
            <Button 
              onClick={handleSendCampaign} 
              disabled={sendingLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingLoading ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Enviando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Enviar Ahora
                </>
              )}
            </Button>
          )}
          
          {['DRAFT', 'SCHEDULED'].includes(campaign.status) && (
            <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Destinatarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.totalRecipients.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.sentCount}</p>
                <div className="text-xs text-gray-500">
                  {campaign.totalRecipients > 0 && 
                    Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
                  }% del total
                </div>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.deliveredCount}</p>
                <div className="text-xs text-green-600">
                  {getSuccessRate()}% tasa de éxito
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.failedCount}</p>
                {campaign.failedCount > 0 && (
                  <div className="text-xs text-red-600">
                    {Math.round((campaign.failedCount / campaign.totalRecipients) * 100)}% del total
                  </div>
                )}
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              Detalles de la Campaña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Mensaje</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{campaign.message}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{campaign.message.length} caracteres</span>
                  {campaign.template && (
                    <span className="text-blue-600">
                      Plantilla: {campaign.template.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {campaign.type === 'IMMEDIATE' ? 'Envío inmediato' : 'Envío programado'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Audiencia</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {campaign.targetType === 'LIST' ? 
                    `Lista: ${campaign.contactList?.name}` : 
                    'Todos los contactos'
                  }
                </p>
              </div>
            </div>

            {campaign.scheduledAt && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Programado para</Label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(new Date(campaign.scheduledAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            )}

            {campaign.startedAt && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Iniciado</Label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {format(new Date(campaign.startedAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            )}

            {campaign.completedAt && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Completado</Label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                  {format(new Date(campaign.completedAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost & Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-green-600" />
              Costos y Créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Costo estimado</Label>
                <p className="text-lg font-bold text-gray-900">
                  {campaign.estimatedCost.toLocaleString()} créditos
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Costo real</Label>
                <p className="text-lg font-bold text-gray-900">
                  {campaign.creditsUsed.toLocaleString()} créditos
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-gray-600">Créditos disponibles</Label>
              <p className="text-lg font-bold text-gray-900">
                {campaign.company.credits.toLocaleString()} créditos
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Eficiencia</span>
                <span className="text-blue-900">
                  {campaign.estimatedCost > 0 ? 
                    Math.round((campaign.creditsUsed / campaign.estimatedCost) * 100) : 0
                  }%
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {campaign.creditsUsed <= campaign.estimatedCost ? 
                  'Dentro del presupuesto estimado' : 
                  'Excedió el presupuesto estimado'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      {campaign.messages && campaign.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-purple-600" />
              Mensajes Enviados ({campaign.messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Enviado</TableHead>
                    <TableHead>Entregado</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">Créditos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.messages.slice(0, 50).map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-mono text-sm">
                        {message.phone}
                      </TableCell>
                      <TableCell>
                        {getMessageStatusBadge(message.status)}
                      </TableCell>
                      <TableCell>
                        {message.sentAt ? (
                          <div className="text-sm">
                            <div>{format(new Date(message.sentAt), 'dd/MM/yyyy')}</div>
                            <div className="text-gray-500 text-xs">
                              {format(new Date(message.sentAt), 'HH:mm:ss')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {message.deliveredAt ? (
                          <div className="text-sm">
                            <div>{format(new Date(message.deliveredAt), 'dd/MM/yyyy')}</div>
                            <div className="text-gray-500 text-xs">
                              {format(new Date(message.deliveredAt), 'HH:mm:ss')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {message.failReason ? (
                          <span className="text-red-600 text-xs">
                            {message.failReason}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {message.creditsUsed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {campaign.messages.length > 50 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Mostrando primeros 50 mensajes de {campaign.messages.length} total
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for labels
function Label({ className, children, ...props }: any) {
  return (
    <label className={`block text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}



'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  creditsUsed: number;
  createdAt: Date;
}

interface RecentCampaignsProps {
  campaigns: Campaign[];
}

export function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      DRAFT: { 
        label: 'Borrador', 
        className: 'bg-gray-100 text-gray-800',
        icon: Clock
      },
      SCHEDULED: { 
        label: 'Programada', 
        className: 'bg-blue-100 text-blue-800',
        icon: Clock
      },
      SENDING: { 
        label: 'Enviando', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      SENT: { 
        label: 'Enviada', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      FAILED: { 
        label: 'Fallida', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
            Campañas Recientes
          </CardTitle>
          <Link href="/dashboard/campaigns/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Campaña
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay campañas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera campaña de SMS.
            </p>
            <Link href="/dashboard/campaigns/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Campaña
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>{campaign.totalRecipients} destinatarios</span>
                      <span>{campaign.creditsUsed} créditos</span>
                    </div>
                    
                    {campaign.status === 'SENT' && (
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600">
                          ✓ {campaign.deliveredCount} entregados
                        </span>
                        {campaign.failedCount > 0 && (
                          <span className="text-red-600">
                            ✗ {campaign.failedCount} fallidos
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(campaign.createdAt, { 
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4 border-t">
              <Link href="/dashboard/campaigns">
                <Button variant="outline">Ver Todas las Campañas</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyCampaign {
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

interface CompanyCampaignsProps {
  campaigns: CompanyCampaign[];
  companyId: string;
}

export function CompanyCampaigns({ campaigns, companyId }: CompanyCampaignsProps) {
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
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
          Campañas Recientes ({campaigns.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay campañas creadas
          </p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {campaign.totalRecipients} destinatarios • {campaign.creditsUsed} créditos
                  </div>
                  {campaign.status === 'SENT' && (
                    <div className="text-xs text-gray-400 mt-1">
                      ✓ {campaign.deliveredCount} entregados • ✗ {campaign.failedCount} fallidos
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(campaign.createdAt, { addSuffix: true, locale: es })}
                  </div>
                </div>
                <div>
                  {getStatusBadge(campaign.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, AlertTriangle } from 'lucide-react';

interface CreditBalanceProps {
  credits: number;
  companyName: string;
}

export function CreditBalance({ credits, companyName }: CreditBalanceProps) {
  const getCreditStatus = (credits: number) => {
    if (credits > 1000) {
      return {
        status: 'high',
        color: 'bg-green-100 text-green-800',
        icon: CreditCard,
        message: 'Saldo saludable'
      };
    } else if (credits > 100) {
      return {
        status: 'medium',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        message: 'Considera recargar'
      };
    } else {
      return {
        status: 'low',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        message: 'Saldo bajo'
      };
    }
  };

  const creditStatus = getCreditStatus(credits);
  const StatusIcon = creditStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
          Saldo de Créditos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* Current Balance */}
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {credits.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">créditos disponibles</p>
          </div>

          {/* Status Badge */}
          <Badge className={creditStatus.color}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {creditStatus.message}
          </Badge>

          {/* Actions */}
          <div className="space-y-2">
            <Link href="/dashboard/credits">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Recargar Créditos
              </Button>
            </Link>
            
            <Link href="/dashboard/credits/history">
              <Button variant="outline" className="w-full">
                Ver Historial
              </Button>
            </Link>
          </div>

          {/* Credit Info */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
            <p>• 1 crédito = 1 SMS nacional</p>
            <p>• Los créditos no expiran</p>
            <p>• Recarga mínima: 100 créditos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

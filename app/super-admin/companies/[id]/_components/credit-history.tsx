

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Minus, RotateCcw, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  createdAt: Date;
}

interface CreditHistoryProps {
  transactions: CreditTransaction[];
  companyId: string;
}

export function CreditHistory({ transactions, companyId }: CreditHistoryProps) {
  const getTransactionBadge = (type: string, amount: number) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      PURCHASE: { 
        label: 'Compra', 
        className: 'bg-green-100 text-green-800',
        icon: Plus
      },
      USAGE: { 
        label: 'Uso', 
        className: 'bg-red-100 text-red-800',
        icon: Minus
      },
      REFUND: { 
        label: 'Reembolso', 
        className: 'bg-blue-100 text-blue-800',
        icon: RotateCcw
      },
      ADJUSTMENT: { 
        label: 'Ajuste', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Settings
      },
    };

    const transactionConfig = config[type] || config.ADJUSTMENT;
    const Icon = transactionConfig.icon;

    return (
      <Badge className={transactionConfig.className}>
        <Icon className="mr-1 h-3 w-3" />
        {transactionConfig.label}
      </Badge>
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const isNegative = amount < 0 || type === 'USAGE';
    return `${isNegative ? '' : '+'}${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-orange-600" />
          Historial de Créditos ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay transacciones de créditos
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getTransactionBadge(transaction.type, transaction.amount)}
                    <span className="font-medium text-gray-900">
                      {formatAmount(transaction.amount, transaction.type)} créditos
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(transaction.createdAt, { addSuffix: true, locale: es })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Saldo: {transaction.balance.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

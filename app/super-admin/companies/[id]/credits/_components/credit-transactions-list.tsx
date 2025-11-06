

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Plus, Minus, RotateCcw, Settings } from 'lucide-react';
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

interface CreditTransactionsListProps {
  transactions: CreditTransaction[];
}

export function CreditTransactionsList({ transactions }: CreditTransactionsListProps) {
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
    const absAmount = Math.abs(amount);
    return `${isNegative ? '-' : '+'}${absAmount.toLocaleString()}`;
  };

  const getAmountColor = (amount: number, type: string) => {
    const isNegative = amount < 0 || type === 'USAGE';
    return isNegative ? 'text-red-600' : 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5 text-purple-600" />
          Historial de Transacciones ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sin transacciones
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay transacciones de créditos registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`flex items-start justify-between p-3 border rounded-lg ${
                  index === 0 ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTransactionBadge(transaction.type, transaction.amount)}
                    <span className={`font-medium ${getAmountColor(transaction.amount, transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)} créditos
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {transaction.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatDistanceToNow(transaction.createdAt, { 
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                    <span>
                      Saldo: <strong>{transaction.balance.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {transactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Saldo actual:</span>
              <span className="font-medium text-gray-900">
                {transactions[0]?.balance.toLocaleString() || 0} créditos
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

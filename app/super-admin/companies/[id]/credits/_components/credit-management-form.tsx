

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Plus, Minus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  credits: number;
}

interface CreditManagementFormProps {
  company: Company;
}

export function CreditManagementForm({ company }: CreditManagementFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.description) {
      toast({
        title: 'Error de validación',
        description: 'Todos los campos son requeridos',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La cantidad debe ser un número positivo',
        variant: 'destructive',
      });
      return;
    }

    // Check for negative balance
    if (formData.type === 'USAGE' || formData.type === 'ADJUSTMENT') {
      const finalAmount = formData.type === 'USAGE' ? -amount : (formData.amount.startsWith('-') ? amount : -amount);
      if (company.credits + finalAmount < 0) {
        toast({
          title: 'Error de validación',
          description: 'No se pueden realizar ajustes que resulten en créditos negativos',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/super-admin/companies/${company.id}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la transacción');
      }

      toast({
        title: '¡Transacción exitosa!',
        description: `Créditos ${formData.type === 'PURCHASE' || (formData.type === 'ADJUSTMENT' && !formData.amount.startsWith('-')) ? 'agregados' : 'deducidos'} correctamente`,
      });

      // Reset form
      setFormData({
        type: '',
        amount: '',
        description: '',
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error en la transacción',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value,
    }));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PURCHASE: 'Agregar Créditos',
      ADJUSTMENT: 'Ajuste Manual',
      REFUND: 'Reembolso',
      USAGE: 'Deducir Créditos',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'PURCHASE' || type === 'REFUND' || (type === 'ADJUSTMENT' && !formData.amount.startsWith('-'))) {
      return <Plus className="h-4 w-4 text-green-600" />;
    }
    return <Minus className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
          Gestionar Créditos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Balance */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium">Saldo Actual</p>
            <p className="text-3xl font-bold text-blue-900">
              {company.credits.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">créditos disponibles</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Transacción</Label>
            <Select value={formData.type} onValueChange={handleTypeChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE">Agregar Créditos (Compra)</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste Manual</SelectItem>
                <SelectItem value="REFUND">Reembolso</SelectItem>
                <SelectItem value="USAGE">Deducir Créditos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Cantidad</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              placeholder="100"
              value={formData.amount}
              onChange={handleChange}
              disabled={isLoading}
            />
            {formData.type === 'ADJUSTMENT' && (
              <p className="text-xs text-gray-500 mt-1">
                Para restar créditos, usa un número negativo (ej: -50)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Motivo de la transacción..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.type && formData.amount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  {getTypeIcon(formData.type)}
                  <span>{getTypeLabel(formData.type)}</span>
                </span>
                <span className="font-medium">
                  {formData.type === 'USAGE' ? '-' : (formData.type === 'ADJUSTMENT' && formData.amount.startsWith('-')) ? '' : '+'}
                  {Math.abs(parseInt(formData.amount || '0')).toLocaleString()} créditos
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Nuevo saldo: <strong>
                  {(() => {
                    const amount = parseInt(formData.amount || '0');
                    let change = amount;
                    if (formData.type === 'USAGE') change = -amount;
                    if (formData.type === 'ADJUSTMENT' && formData.amount.startsWith('-')) change = amount;
                    return (company.credits + change).toLocaleString();
                  })()} créditos
                </strong>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.type || !formData.amount || !formData.description}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Ejecutar Transacción
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

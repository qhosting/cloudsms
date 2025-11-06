

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, DollarSign, Settings, Key, Mail } from 'lucide-react';

interface SystemConfigFormProps {
  config: {
    sms_price: string;
    whatsapp_price: string;
    default_credits: string;
    max_daily_messages: string;
    labsmobile_api_key: string;
    evolution_api_url: string;
    system_email: string;
  };
}

export function SystemConfigForm({ config }: SystemConfigFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/super-admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la configuración');
      }

      toast({
        title: '¡Configuración actualizada!',
        description: 'Los cambios se han guardado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error al actualizar configuración',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
            Configuración de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sms_price">Precio por SMS (MXN)</Label>
              <Input
                id="sms_price"
                name="sms_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.50"
                value={formData.sms_price}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_price">Precio por WhatsApp (MXN)</Label>
              <Input
                id="whatsapp_price"
                name="whatsapp_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.30"
                value={formData.whatsapp_price}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-blue-600" />
            Límites del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_credits">Créditos por Defecto</Label>
              <Input
                id="default_credits"
                name="default_credits"
                type="number"
                min="0"
                placeholder="100"
                value={formData.default_credits}
                onChange={handleChange}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Créditos asignados a nuevas empresas
              </p>
            </div>

            <div>
              <Label htmlFor="max_daily_messages">Máximo Mensajes por Día</Label>
              <Input
                id="max_daily_messages"
                name="max_daily_messages"
                type="number"
                min="1"
                placeholder="1000"
                value={formData.max_daily_messages}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5 text-yellow-600" />
            Configuración de APIs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="labsmobile_api_key">LabsMobile API Key</Label>
            <Input
              id="labsmobile_api_key"
              name="labsmobile_api_key"
              type="password"
              placeholder="Tu API Key de LabsMobile"
              value={formData.labsmobile_api_key}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="evolution_api_url">Evolution API URL</Label>
            <Input
              id="evolution_api_url"
              name="evolution_api_url"
              type="url"
              placeholder="https://api.evolution.com"
              value={formData.evolution_api_url}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-purple-600" />
            Configuración de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="system_email">Email del Sistema</Label>
            <Input
              id="system_email"
              name="system_email"
              type="email"
              placeholder="admin@smscloudmx.com"
              value={formData.system_email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Email usado para notificaciones del sistema
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

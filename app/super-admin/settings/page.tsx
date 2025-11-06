

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { SystemConfigForm } from './_components/system-config-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, DollarSign, Zap, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Configuración del Sistema - Super Admin',
  description: 'Configurar precios, límites y opciones del sistema',
};

async function getSystemConfig() {
  const configs = await prisma.systemConfig.findMany({
    orderBy: {
      key: 'asc'
    }
  });
  
  // Convert to key-value object for easier handling
  const configObj: Record<string, string> = {};
  configs.forEach(config => {
    configObj[config.key] = config.value;
  });
  
  // Set defaults if not exists
  return {
    sms_price: configObj.sms_price || '0.50',
    whatsapp_price: configObj.whatsapp_price || '0.30',
    default_credits: configObj.default_credits || '100',
    max_daily_messages: configObj.max_daily_messages || '1000',
    labsmobile_api_key: configObj.labsmobile_api_key || '',
    evolution_api_url: configObj.evolution_api_url || '',
    system_email: configObj.system_email || 'admin@smscloudmx.com',
  };
}

export default async function SystemSettingsPage() {
  const config = await getSystemConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="mt-2 text-gray-600">
          Gestiona los precios, límites y configuraciones globales del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemConfigForm config={config} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Precios Actuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SMS:</span>
                  <span className="font-medium">${config.sms_price} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">WhatsApp:</span>
                  <span className="font-medium">${config.whatsapp_price} MXN</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                Límites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Créditos por defecto:</span>
                  <span className="font-medium">{config.default_credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Máx. mensajes/día:</span>
                  <span className="font-medium">{config.max_daily_messages}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Database className="mr-2 h-5 w-5 text-blue-600" />
                Estado de APIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LabsMobile:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    config.labsmobile_api_key ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config.labsmobile_api_key ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Evolution API:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    config.evolution_api_url ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config.evolution_api_url ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

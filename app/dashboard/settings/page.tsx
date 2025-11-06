

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Building2, Bell, Shield } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">
          Gestiona las configuraciones de tu cuenta y empresa
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Perfil Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Configuración Personal
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-green-600" />
              Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Configuración de Empresa
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-yellow-600" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Preferencias de Notificación
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-red-600" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Configuración de Seguridad
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-purple-600" />
            Centro de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <Settings className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Módulo en Desarrollo
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El centro de configuración te permitirá personalizar todos 
              los aspectos de tu cuenta y configuración de la empresa.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-400">Configuraciones incluirán:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Información personal y de empresa</li>
                <li>• Configuración de API keys</li>
                <li>• Webhooks y integraciones</li>
                <li>• Preferencias de notificación</li>
                <li>• Configuración de facturación</li>
                <li>• Gestión de usuarios y permisos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

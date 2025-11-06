

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Users, 
  List, 
  Upload,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';

const quickActions = [
  {
    title: 'Nueva Campaña',
    description: 'Crear una nueva campaña de SMS',
    href: '/dashboard/campaigns/new',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Importar Contactos',
    description: 'Subir contactos desde CSV o Excel',
    href: '/dashboard/contacts/import',
    icon: Upload,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Crear Lista',
    description: 'Organizar contactos en listas',
    href: '/dashboard/lists/new',
    icon: List,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Ver Analíticas',
    description: 'Revisar métricas y reportes',
    href: '/dashboard/analytics',
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-600'
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-600" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/settings" className="flex-1">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </Link>
            <Link href="/dashboard/contacts" className="flex-1">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Contactos
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

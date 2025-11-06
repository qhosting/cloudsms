

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { ArrowLeft, Edit, User, Building2, Mail, Calendar, Activity } from 'lucide-react';
import { ImpersonateButton } from '@/components/impersonate-button';
import { ResetPasswordButton } from '@/components/reset-password-button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserDetailsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: UserDetailsPageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { firstName: true, lastName: true, email: true }
  });

  return {
    title: `${user?.firstName || 'Usuario'} ${user?.lastName || ''} - Super Admin`,
    description: `Detalles del usuario ${user?.email || 'No encontrado'}`,
  };
}

async function getUserDetails(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          credits: true
        }
      },
      createdCampaigns: {
        select: {
          id: true,
          name: true,
          status: true,
          totalRecipients: true,
          sentCount: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
      _count: {
        select: {
          createdCampaigns: true,
          createdContactLists: true
        }
      }
    }
  });

  return user;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const user = await getUserDetails(params.id);

  if (!user) {
    notFound();
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      SUPER_ADMIN: { 
        label: 'Super Admin', 
        className: 'bg-red-100 text-red-800' 
      },
      COMPANY_ADMIN: { 
        label: 'Admin de Empresa', 
        className: 'bg-blue-100 text-blue-800' 
      },
      USER: { 
        label: 'Usuario', 
        className: 'bg-green-100 text-green-800' 
      },
    };

    const roleConfig = config[role] || config.USER;
    return (
      <Badge className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/super-admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Usuarios
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <ImpersonateButton
            userId={user.id}
            userName={`${user.firstName} ${user.lastName}`}
            userEmail={user.email}
            userRole={user.role}
            disabled={!user.isActive}
          />
          <ResetPasswordButton
            userId={user.id}
            userName={`${user.firstName} ${user.lastName}`}
            userEmail={user.email}
            userRole={user.role}
            disabled={!user.isActive}
          />
          <Link href={`/super-admin/users/${user.id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Editar Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre Completo</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <div className="mt-1">
                    <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {user.createdAt.toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Último Acceso</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {user.lastLoginAt 
                        ? formatDistanceToNow(user.lastLoginAt, { addSuffix: true, locale: es })
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {user.createdCampaigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.createdCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          {campaign.totalRecipients} destinatarios
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(campaign.createdAt, { addSuffix: true, locale: es })}
                        </div>
                      </div>
                      <div>
                        <Badge className={
                          campaign.status === 'SENT' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {campaign.status === 'SENT' ? 'Enviada' :
                           campaign.status === 'DRAFT' ? 'Borrador' : 
                           campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Company Info and Stats */}
        <div className="space-y-6">
          
          {/* Company Information */}
          {user.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-green-600" />
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                    <Link 
                      href={`/super-admin/companies/${user.company.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {user.company.name}
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-sm text-gray-900">{user.company.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Créditos</h3>
                    <p className="text-sm text-gray-900 font-medium">
                      {user.company.credits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Campañas Creadas</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user._count.createdCampaigns}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Listas de Contactos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user._count.createdContactLists}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Días desde registro</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/super-admin/users/${user.id}/edit`}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Usuario
                </Button>
              </Link>
              
              {user.role !== 'SUPER_ADMIN' && user.isActive && (
                <ResetPasswordButton
                  userId={user.id}
                  userName={`${user.firstName} ${user.lastName}`}
                  userEmail={user.email}
                  userRole={user.role}
                  disabled={!user.isActive}
                  variant="full-width"
                />
              )}
              
              {user.company && (
                <Link href={`/super-admin/companies/${user.company.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Ver Empresa
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Mail, Calendar, Activity, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TeamMemberPageProps {
  params: {
    id: string;
  };
}

async function getTeamMember(userId: string, companyId: string) {
  return await prisma.user.findFirst({
    where: { 
      id: userId,
      companyId,
      role: {
        not: 'SUPER_ADMIN' // Don't show super admins in team view
      }
    },
    include: {
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
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    redirect('/dashboard');
  }

  const teamMember = await getTeamMember(params.id, session.user.companyId);

  if (!teamMember) {
    notFound();
  }

  const isCompanyAdmin = session.user.role === 'COMPANY_ADMIN';
  const isCurrentUser = teamMember.id === session.user.id;

  const getRoleBadge = (role: string) => {
    if (role === 'COMPANY_ADMIN') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Shield className="mr-1 h-3 w-3" />
          Administrador
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800">
        <User className="mr-1 h-3 w-3" />
        Usuario
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/team">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Equipo
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {teamMember.firstName} {teamMember.lastName}
              {isCurrentUser && (
                <span className="ml-2 text-xl text-blue-600 font-medium">
                  (Tú)
                </span>
              )}
            </h1>
            <p className="mt-1 text-gray-600">{teamMember.email}</p>
          </div>
        </div>
        {isCompanyAdmin && !isCurrentUser && (
          <div className="flex items-center space-x-3">
            <Link href={`/dashboard/team/${teamMember.id}/edit`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="mr-2 h-4 w-4" />
                Editar Usuario
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
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
                    {teamMember.firstName} {teamMember.lastName}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{teamMember.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                  <div className="mt-1">
                    {getRoleBadge(teamMember.role)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <div className="mt-1">
                    <Badge className={teamMember.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {teamMember.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Ingreso</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {teamMember.createdAt.toLocaleDateString('es-MX', { 
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
                      {teamMember.lastLoginAt 
                        ? formatDistanceToNow(teamMember.lastLoginAt, { addSuffix: true, locale: es })
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {teamMember.createdCampaigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campañas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMember.createdCampaigns.map((campaign) => (
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

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Campañas Creadas</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teamMember._count.createdCampaigns}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Listas de Contactos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teamMember._count.createdContactLists}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Días en el equipo</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor((Date.now() - teamMember.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isCompanyAdmin && !isCurrentUser && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/team/${teamMember.id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Usuario
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

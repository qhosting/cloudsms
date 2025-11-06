

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Eye, Shield, User as UserIcon, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  _count: {
    createdCampaigns: number;
    createdContactLists: number;
  };
}

interface CurrentUser {
  id: string;
  role: string;
  email: string;
}

interface TeamTableProps {
  teamMembers: TeamMember[];
  currentUser: CurrentUser;
  canManage: boolean;
}

export function TeamTable({ teamMembers, currentUser, canManage }: TeamTableProps) {
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
        <UserIcon className="mr-1 h-3 w-3" />
        Usuario
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          Miembros del Equipo ({teamMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sin miembros de equipo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {canManage 
                ? 'Comienza invitando a tu primer miembro del equipo.'
                : 'No hay otros miembros en tu equipo actualmente.'
              }
            </p>
            {canManage && (
              <Link href="/dashboard/team/invite">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Invitar Usuario
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const isCurrentUser = member.id === currentUser.id;
                  
                  return (
                    <tr key={member.id} className={isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600 font-medium">
                                  (Tú)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(member.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>{member._count.createdCampaigns} campañas</div>
                          <div className="text-xs text-gray-500">
                            {member._count.createdContactLists} listas
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastLoginAt 
                          ? formatDistanceToNow(member.lastLoginAt, { addSuffix: true, locale: es })
                          : 'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/dashboard/team/${member.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {canManage && !isCurrentUser && (
                            <Link href={`/dashboard/team/${member.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

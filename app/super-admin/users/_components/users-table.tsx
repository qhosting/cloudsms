

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Search, Shield, Building2, Eye, Edit } from 'lucide-react';
import { ImpersonateButton } from '@/components/impersonate-button';
import { ResetPasswordButton } from '@/components/reset-password-button';
import { BulkActions } from './bulk-actions';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  company: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [filter, setFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(filter.toLowerCase()) ||
    user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    (user.company?.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const selectableUsers = filteredUsers.filter(user => user.role !== 'SUPER_ADMIN');
      setSelectedUsers(selectableUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [filteredUsers]);

  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      if (checked) {
        return [...prev, userId];
      } else {
        return prev.filter(id => id !== userId);
      }
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const handleActionComplete = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    // You could also refresh the data here if needed
  }, []);

  const selectableUsers = filteredUsers.filter(user => user.role !== 'SUPER_ADMIN');
  const allSelectableSelected = selectableUsers.length > 0 && 
    selectableUsers.every(user => selectedUsers.includes(user.id));

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SUPER_ADMIN: { 
        label: 'Super Admin', 
        className: 'bg-red-100 text-red-800' 
      },
      COMPANY_ADMIN: { 
        label: 'Admin', 
        className: 'bg-blue-100 text-blue-800' 
      },
      USER: { 
        label: 'Usuario', 
        className: 'bg-green-100 text-green-800' 
      },
    };

    const badge = badges[role] || { 
      label: role, 
      className: 'bg-gray-100 text-gray-800' 
    };

    return (
      <Badge className={badge.className}>
        {role === 'SUPER_ADMIN' && <Shield className="mr-1 h-3 w-3" />}
        {badge.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
    );
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;
  const companyAdmins = users.filter(u => u.role === 'COMPANY_ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">{superAdmins}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins de Empresa</p>
              <p className="text-2xl font-bold text-gray-900">{companyAdmins}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedUsers={selectedUsers}
        allUsers={users}
        onActionComplete={handleActionComplete}
        onClearSelection={handleClearSelection}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Lista de Usuarios ({filteredUsers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No se encontraron usuarios
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta con otros términos de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelectableSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const canSelect = user.role !== 'SUPER_ADMIN';
                    const isSelected = selectedUsers.includes(user.id);
                    
                    return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        {canSelect ? (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                            aria-label={`Seleccionar ${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <div className="w-4 h-4" /> // Placeholder for super admins
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.jobTitle && (
                            <div className="text-xs text-gray-400">{user.jobTitle}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.company ? (
                          <div>
                            <div className="font-medium text-gray-900">{user.company.name}</div>
                            <div className="text-sm text-gray-500">{user.company.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Sin empresa</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {user.lastLoginAt ? 
                            formatDistanceToNow(user.lastLoginAt, { 
                              addSuffix: true,
                              locale: es
                            }) : 'Nunca'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(user.createdAt, { 
                            addSuffix: true,
                            locale: es
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-1">
                          <Link href={`/super-admin/users/${user.id}`}>
                            <Button variant="outline" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <Link href={`/super-admin/users/${user.id}/edit`}>
                            <Button variant="outline" size="sm" title="Editar usuario">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <ResetPasswordButton
                            userId={user.id}
                            userName={`${user.firstName} ${user.lastName}`}
                            userEmail={user.email}
                            userRole={user.role}
                            disabled={!user.isActive}
                          />

                          <ImpersonateButton
                            userId={user.id}
                            userName={`${user.firstName} ${user.lastName}`}
                            userEmail={user.email}
                            userRole={user.role}
                            disabled={!user.isActive}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

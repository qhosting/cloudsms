

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface CompanyUsersProps {
  users: CompanyUser[];
  companyId: string;
}

export function CompanyUsers({ users, companyId }: CompanyUsersProps) {
  const getRoleBadge = (role: string) => {
    if (role === 'COMPANY_ADMIN') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Shield className="mr-1 h-3 w-3" />
          Admin
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay usuarios registrados
          </p>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Último acceso: {user.lastLoginAt 
                      ? formatDistanceToNow(user.lastLoginAt, { addSuffix: true, locale: es })
                      : 'Nunca'
                    }
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getRoleBadge(user.role)}
                  <Badge 
                    variant={user.isActive ? "default" : "secondary"}
                    className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {users.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Y {users.length - 5} usuario{users.length - 5 !== 1 ? 's' : ''} más...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

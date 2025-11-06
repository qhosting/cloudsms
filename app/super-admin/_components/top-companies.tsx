

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: Date;
  _count: {
    users: number;
    campaigns: number;
  };
}

interface TopCompaniesProps {
  companies: Company[];
}

export function TopCompanies({ companies }: TopCompaniesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-blue-600" />
          Empresas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay empresas registradas recientemente
          </p>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                    <Badge variant="secondary">
                      {company.credits} créditos
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{company.email}</p>
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {company._count.users} usuarios
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {company._count.campaigns} campañas
                    </div>
                  </div>
                </div>
                <Link
                  href={`/super-admin/companies/${company.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver detalles
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

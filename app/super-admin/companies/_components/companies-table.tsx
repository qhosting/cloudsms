

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  CreditCard, 
  Users,
  MessageSquare,
  Building2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  credits: number;
  createdAt: Date;
  _count: {
    users: number;
    campaigns: number;
    transactions: number;
  };
}

interface CompaniesTableProps {
  companies: Company[];
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const [filter, setFilter] = useState('');

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(filter.toLowerCase()) ||
    company.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-blue-600" />
          Empresas Registradas ({companies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Campañas</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">ID: {company.id.slice(-8)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{company.email}</div>
                      {company.phone && (
                        <div className="text-sm text-gray-500">{company.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{company._count.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{company._count.campaigns}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={company.credits > 100 ? "default" : company.credits > 0 ? "secondary" : "destructive"}
                      className="flex items-center w-fit"
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      {company.credits}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(company.createdAt, { 
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/super-admin/companies/${company.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/super-admin/companies/${company.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/super-admin/companies/${company.id}/credits`}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Gestionar Créditos
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron empresas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {companies.length === 0 
                ? 'No hay empresas registradas aún.'
                : 'Intenta con otros términos de búsqueda.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

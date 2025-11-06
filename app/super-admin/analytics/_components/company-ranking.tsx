

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  email: string;
  credits: number;
  _count: {
    campaigns: number;
    users: number;
  };
}

interface CompanyRankingProps {
  companies: Company[];
}

export function CompanyRanking({ companies }: CompanyRankingProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-500" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800">1°</Badge>;
      case 1:
        return <Badge className="bg-gray-100 text-gray-800">2°</Badge>;
      case 2:
        return <Badge className="bg-amber-100 text-amber-800">3°</Badge>;
      default:
        return <Badge variant="secondary">{index + 1}°</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
          Ranking de Empresas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay empresas registradas
            </p>
          ) : (
            companies.map((company, index) => (
              <div
                key={company.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                  index < 3 ? 'border-yellow-200 bg-yellow-50/50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(index)}
                    {getRankBadge(index)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{company.name}</h4>
                    <p className="text-sm text-gray-500">{company.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {company._count.campaigns} campañas
                  </div>
                  <div className="text-xs text-gray-500">
                    {company._count.users} usuarios • {company.credits} créditos
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {companies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/super-admin/companies"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las empresas →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

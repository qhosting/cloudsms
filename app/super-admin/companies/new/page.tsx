

import { Metadata } from 'next';
import { NewCompanyForm } from './_components/new-company-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nueva Empresa - Super Admin',
  description: 'Crear una nueva empresa en el sistema',
};

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/super-admin/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Empresa</h1>
          <p className="mt-2 text-gray-600">
            Crear una nueva empresa y su administrador principal
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <NewCompanyForm />
      </div>
    </div>
  );
}

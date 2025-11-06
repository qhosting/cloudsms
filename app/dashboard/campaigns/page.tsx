
import { Metadata } from 'next';
import { Suspense } from 'react';
import { CampaignsTable } from './_components/campaigns-table';

export const metadata: Metadata = {
  title: 'Campañas - SMS CloudMX',
  description: 'Gestiona tus campañas de SMS',
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y monitorea tus campañas de SMS marketing
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="bg-white rounded-lg border p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      }>
        <CampaignsTable />
      </Suspense>
    </div>
  );
}

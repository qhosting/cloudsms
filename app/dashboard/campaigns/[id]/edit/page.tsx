

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignEditForm } from '../../_components/campaign-edit-form';

interface CampaignEditPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CampaignEditPageProps): Promise<Metadata> {
  return {
    title: 'Editar Campaña - SMS CloudMX',
    description: 'Editar campaña de SMS',
  };
}

export default function CampaignEditPage({ params }: CampaignEditPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Campaña</h1>
        <p className="mt-2 text-gray-600">
          Modifica los detalles de tu campaña de SMS
        </p>
      </div>

      <CampaignEditForm campaignId={params.id} />
    </div>
  );
}

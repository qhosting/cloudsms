

import { Metadata } from 'next';
import { CampaignCreationForm } from '../_components/campaign-creation-form';

export const metadata: Metadata = {
  title: 'Nueva Campaña - SMS CloudMX',
  description: 'Crea una nueva campaña de SMS',
};

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Campaña</h1>
        <p className="mt-2 text-gray-600">
          Crea una nueva campaña de SMS marketing
        </p>
      </div>

      <CampaignCreationForm />
    </div>
  );
}

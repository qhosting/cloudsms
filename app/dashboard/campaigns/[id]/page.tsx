

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignDetailsView } from '../_components/campaign-details-view';

interface CampaignDetailsPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CampaignDetailsPageProps): Promise<Metadata> {
  return {
    title: 'Detalles de Campaña - SMS CloudMX',
    description: 'Ver detalles de la campaña',
  };
}

export default function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  if (!params.id) {
    notFound();
  }

  return <CampaignDetailsView campaignId={params.id} />;
}

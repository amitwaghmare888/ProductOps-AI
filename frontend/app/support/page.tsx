'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';

export default function SupportPage() {
  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Support"
        subtitle="Get help with ProductOps AI"
      >
        <BentoCard className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
            help
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mb-2">
            Support Resources Coming Soon
          </p>
          <p className="text-body-base text-on-surface-variant">
            Contact information and support channels will be available here.
          </p>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}

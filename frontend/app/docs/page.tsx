'use client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { BentoCard } from '@/components/ui/BentoCard';

export default function DocsPage() {
  return (
    <AppLayout title="ProductOps AI">
      <PageContainer
        title="Documentation"
        subtitle="Learn how to use ProductOps AI effectively"
      >
        <BentoCard className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
            menu_book
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mb-2">
            Documentation Coming Soon
          </p>
          <p className="text-body-base text-on-surface-variant">
            Comprehensive guides and API references will be available here.
          </p>
        </BentoCard>
      </PageContainer>
    </AppLayout>
  );
}

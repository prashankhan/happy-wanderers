import { Container } from "@/components/layout/container";

export function BookingLoading() {
  return (
    <div className="bg-white pb-32 lg:pb-24">
      <Container className="px-4 pt-8 sm:px-6 lg:pt-12">
        <div className="grid animate-pulse gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
          <div className="space-y-8">
            <div className="h-48 rounded-sm border border-brand-border bg-brand-surface-soft" />
            <div className="h-64 rounded-sm border border-brand-border bg-brand-surface-soft" />
          </div>
          <aside className="lg:sticky lg:top-40">
            <div className="h-80 rounded-sm border border-brand-border bg-brand-surface-soft shadow-lg" />
          </aside>
        </div>
      </Container>
    </div>
  );
}

import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={cn(baseStyles, styles[status] ?? styles.draft, className)}>
      {status}
    </span>
  );
}

interface FeaturedBadgeProps {
  featured: boolean;
  className?: string;
}

export function FeaturedBadge({ featured, className }: FeaturedBadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  return (
    <span className={cn(baseStyles, featured ? "bg-brand-gold/20 text-amber-700" : "text-brand-muted", className)}>
      {featured ? "Featured" : "—"}
    </span>
  );
}

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { publicMainNavTopPaddingClass } from "@/lib/layout/public-nav-offset";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

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

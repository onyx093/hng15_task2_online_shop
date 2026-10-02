import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { SetupBanner } from '@/components/SetupBanner';

export const metadata: Metadata = {
  title: 'AURA Home & Living — Minimalist Ceramics, Lighting & Objects',
  description:
    'Curated minimalist stoneware, architectural lighting, organic Belgian linens, and handcrafted lifestyle essentials. Persisted with Neon PostgreSQL, confirmed via Mailgun, secured with Google Cloud Console OAuth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <AuthProvider>
          <CartProvider>
            <SetupBanner />
            <Navbar />
            <CartDrawer />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

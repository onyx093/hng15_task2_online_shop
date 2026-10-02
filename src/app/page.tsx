import { getProducts, getCategories } from '@/lib/db';
import { StorefrontCatalog } from '@/components/StorefrontCatalog';
import Link from 'next/link';
import { ArrowDown, Sparkles, Shield, Feather } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white min-h-[85vh] flex items-center">
        {/* Ambient background image with gradient overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
            alt="Minimalist Living Space"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transform motion-safe:animate-fade"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700/80 bg-zinc-900/60 backdrop-blur-md text-xs font-medium tracking-widest uppercase text-zinc-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Spring / Summer 2026 Collection</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight leading-[1.15] text-zinc-50">
              Quiet forms. <br />
              <span className="italic font-normal text-zinc-400">Enduring materials.</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-lg">
              A curated catalog of stoneware ceramics, ambient architectural luminaires, and washed organic linens crafted to bring contemplative warmth to modern spaces.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="px-8 py-4 rounded-full bg-white text-zinc-950 text-xs font-semibold tracking-wider uppercase hover:bg-zinc-200 transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
              >
                <span>Explore Catalog</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/?category=ceramics"
                className="px-6 py-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-medium tracking-wider uppercase backdrop-blur-md border border-zinc-700/60 transition"
              >
                Ceramics & Vases
              </Link>
            </div>

            {/* Quick highlight pillars */}
            <div className="pt-10 grid grid-cols-3 gap-6 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div>
                <span className="font-serif text-lg font-semibold text-white block">100%</span>
                <span>Artisan Handcrafted</span>
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-white block">Neon DB</span>
                <span>Postgres Persisted</span>
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-white block">Mailgun</span>
                <span>Instant Invoices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Visual Highlight Strip */}
      <section className="bg-zinc-100 dark:bg-zinc-900/40 py-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">
                Curated Departments
              </p>
              <h2 className="font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100">
                Explore by Material & Discipline
              </h2>
            </div>
            <a
              href="#catalog"
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 hidden sm:block"
            >
              View Full Index →
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-square bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition"
              >
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-base sm:text-lg font-medium leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-zinc-300 font-light mt-0.5 line-clamp-1 opacity-90">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Catalog Section */}
      <StorefrontCatalog
        initialProducts={products}
        categories={categories}
        initialCategory={category}
        initialSearch={search}
      />

      {/* Artisan Ethos & Sustainability Section */}
      <section className="bg-zinc-900 text-white py-20 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                The Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-snug">
                "We believe objects in the home should age with dignity, shaped by touch and time."
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                Each piece in our assortment is produced in small editions. Our stoneware comes from family kilns in Kyoto, our stone lights are carved from Italian travertine boulders, and our Belgian linens are woven from certified European organic flax.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-6 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <Feather className="w-5 h-5 text-zinc-400 shrink-0" />
                  <div>
                    <strong className="text-white block font-medium">Tactile Raw Textures</strong>
                    <span className="text-zinc-400">Natural unglazed exteriors with food-safe silky interiors.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-zinc-400 shrink-0" />
                  <div>
                    <strong className="text-white block font-medium">Built for Decades</strong>
                    <span className="text-zinc-400">High-fire clays and solid metals that patina gracefully.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-2xl border border-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop"
                alt="Artisan ceramic craft process"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

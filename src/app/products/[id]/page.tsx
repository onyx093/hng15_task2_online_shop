import { getProductById, getProducts } from '@/lib/db';
import { ProductDetailView } from '@/components/ProductDetailView';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: 'Product Not Found — AURA Home & Living' };
  }

  return {
    title: `${product.title} — AURA Home & Living`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts({ category: product.category_id });
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}

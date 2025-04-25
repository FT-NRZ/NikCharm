'use client';

import productsData from '../../../app/data/products.json';
import ProductCardEdit from '../../../app/components/cards/AdminEditCard';

export default function EditProductPage() {
  const { products } = productsData;

  return (
    <main className="p-4">
      <h1 className="text-2xl text-right font-bold mb-4">ویرایش محصولات</h1>
      <div className="flex flex-wrap justify-center">
        {products.map((product) => (
          <ProductCardEdit key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
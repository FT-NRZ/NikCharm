import categories from '../../data/categories.json';
import products from '../../data/products.json';

export async function GET() {
  const categoriesWithImages = categories.categories.map((category) => {
    const product = products.products.find(
      (product) =>
        Array.isArray(product.categoryIds) &&
        product.categoryIds.includes(category.id)
    );

    return {
      ...category,
      image: product?.images?.[0] || null
    };
  });

  return Response.json(categoriesWithImages);
}

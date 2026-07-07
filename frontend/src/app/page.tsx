import Hero from "@/components/Hero";
import ProductCard, { Product } from "@/components/ProductCard";

async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const url = `${baseUrl}/products?limit=20`;
    
    const res = await fetch(url, { 
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const list = data.list || [];
    // Shuffle and pick 4
    return list.sort(() => 0.5 - Math.random()).slice(0, 4);
  } catch (error) {
    console.warn("Backend unavailable, using fallback mock data.");
    return [
      {
        pid: "FB001",
        productName: "Organic Cotton Newborn Onesie Set",
        productImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
        sellPrice: 35.99,
        categoryName: "Baby Clothing"
      },
      {
        pid: "FB002",
        productName: "Wooden Montessori Stacking Rings",
        productImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800",
        sellPrice: 24.50,
        categoryName: "Educational Toys"
      },
      {
        pid: "FB003",
        productName: "Premium Ergonomic Baby Carrier",
        productImage: "https://images.unsplash.com/photo-1544126592-807a22002061?w=800",
        sellPrice: 129.00,
        categoryName: "Gear & Travel"
      },
      {
        pid: "FB004",
        productName: "Organic Bamboo Baby Hooded Towel",
        productImage: "https://images.unsplash.com/photo-1610996843657-3f8d22df2422?w=800",
        sellPrice: 28.00,
        categoryName: "Bath & Skincare"
      }
    ];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="-mt-20">
        <Hero />
      </div>
      
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-4">Curated For You</h2>
            <p className="font-sans text-gray-600 max-w-xl">Discover our hand-picked selection of premium essentials, loved by parents and designed for babies.</p>
          </div>
          <a href="/products" className="text-[var(--gold)] font-medium hover:underline whitespace-nowrap">
            View All Products &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.pid} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

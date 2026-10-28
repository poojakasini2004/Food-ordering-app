import Link from "next/link";
import { prisma } from "@/lib/db";
import AddToCartButton from "@/components/menu/AddToCartButton";
import BackButton from "@/components/BackButton";

export default async function MenuPage() {
  // Fetch categories and menu items from database
  const categories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      menuItems: true,
    },
  });

  return (
    <div className="relative min-h-screen">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/image2.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-white/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600">
            🍽 SmartX Foods
          </Link>
          <div className="flex items-center gap-4">
            <BackButton />
            <Link
              href="/cart"
              className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              🛒 View Cart
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Our Menu</h1>
          <p className="mt-2 text-white/80 text-lg drop-shadow">
            Fresh food made daily — order with cash on delivery
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => {
            const items = category.menuItems;

            return (
              <section key={category.id}>
                {/* Category heading */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-white drop-shadow">{category.name}</h2>
                  <div className="flex-1 h-px bg-white/30" />
                </div>

                {items.length === 0 ? (
                  <p className="text-white/60 italic pl-1">No items available in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        aria-disabled={item.isAvailable ? undefined : "true"}
                        className={`bg-white/90 backdrop-blur rounded-2xl shadow-md border overflow-hidden flex flex-col transition-all ${
                          item.isAvailable
                            ? "border-white/50 hover:shadow-lg hover:scale-[1.01]"
                            : "border-white/30 opacity-60 grayscale"
                        }`}
                      >
                        <div
                          className={`h-2 w-full ${
                            item.isAvailable ? "bg-orange-400" : "bg-gray-300"
                          }`}
                        />

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg leading-snug">
                              {item.name}
                            </h3>
                            {!item.isAvailable && (
                              <span className="shrink-0 text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 flex-1 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xl font-bold text-orange-500">
                              ${item.price.toFixed(2)}
                            </span>
                            <AddToCartButton menuItem={item} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

import { PageHeader } from "@/app/admin/_components/PageHeader"
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import prisma from "@/db/db"
import { cache } from "@/lib/cache"
import { Suspense } from "react"

const getProducts = cache(() => {
  return prisma.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  })
}, ["/products", "getProducts"])

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader>Our Products</PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-8 py-12 bg-zinc-100 max-w-7xl mx-auto rounded-sm">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
          >
          <ProductsSuspense />
        </Suspense>
      </div>
    </div>
  )
}

async function ProductsSuspense() {
  const products = await getProducts()

  return products.map(product => <ProductCard key={product.id} {...product} />)
}
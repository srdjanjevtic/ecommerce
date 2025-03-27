import { PageHeader } from "@/app/admin/_components/PageHeader"
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import prisma from "@/db/db"
import { Suspense } from "react"

const getProducts = () => {
  return prisma.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  })
}

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

const getRandomNumber = () => Math.floor(Math.random() * 1000)

async function ProductsSuspense() {
  const products = await getProducts()
  const randomNumber = getRandomNumber()
  if (randomNumber === 0) throw new Error("Error fetching products")

  return products.map(product => <ProductCard key={product.id} {...product} />)
}
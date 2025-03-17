import prisma from "@/db/db"
import { PageHeader } from "../../../_components/PageHeader"
import { ProductForm } from "../../_components/ProductForm"

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({ where: { id } })

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </div>
  )
}
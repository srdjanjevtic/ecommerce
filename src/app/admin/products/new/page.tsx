import { PageHeader } from "../../_components/PageHeader"
import { ProductForm } from "../_components/ProductForm"

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader>Add Product</PageHeader>
      <ProductForm />
    </div>
  )
}
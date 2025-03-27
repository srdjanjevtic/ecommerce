"use client"

import { Link } from "lucide-react"
import { usePathname } from "next/navigation"

const NotFoundPage = () => {
    const pathName = usePathname()
    const productId = pathName.split("/").pop()

  return (

    <div className="text-center max-w-8xl mx-auto">
        <span>{`Product ${productId} not found`}</span>
        <Link href="/products" className="text-blue-500">Products</Link>
        </div>

  )
}

export default NotFoundPage
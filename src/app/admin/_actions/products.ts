"use server"

import prisma from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob";

const fileSchema = z.instanceof(File, { message: "File is required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Empty file"),
  image: imageSchema.refine(file => file.size > 0, "Empty image"),
})

export async function addProduct(prevState: unknown, formData: FormData) {
  // await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000))
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data

  // NON VERCEL HOBBY CODE

  // await fs.mkdir("products", { recursive: true })
  // const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
  // await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

  // await fs.mkdir("public/products", { recursive: true })
  // const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
  // await fs.writeFile(
  //   `public${imagePath}`,
  //   Buffer.from(await data.image.arrayBuffer())
  // )

  // VERCEL HOBBY CODE EXAMPLE
  // Upload file using @vercel/blob
  const fileBuffer = await data.file.arrayBuffer();
  const fileBlob = new Blob([fileBuffer], { type: data.file.type });
  const fileResult = await put(`products/${crypto.randomUUID()}-${data.file.name}`, fileBlob, {
    access: 'public',
  });
  const fileUrl = fileResult.url; // Extract the URL from the PutBlobResult object


  // Upload image using @vercel/blob
  const imageBuffer = await data.image.arrayBuffer();
  const imageBlob = new Blob([imageBuffer], { type: data.image.type });
  const imageResult = await put(`images/${crypto.randomUUID()}-${data.image.name}`, imageBlob, {
    access: 'public',
  });
  const imageUrl = imageResult.url; // Extract the URL from the PutBlobResult object


  await prisma.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: fileUrl,
      imagePath: imageUrl,
    },
  })

  revalidatePath("/")
  revalidatePath("/products")

  redirect("/admin/products")
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data
  const product = await prisma.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  let filePath = product.filePath
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath)
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }

  let imagePath = product.imagePath
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`)
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    )
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })

  revalidatePath("/")
  revalidatePath("/products")

  redirect("/admin/products")
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await prisma.product.update({ where: { id }, data: { isAvailableForPurchase } })

  revalidatePath("/")
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id } })

  if (product == null) return notFound()

  await fs.unlink(product.filePath)
  await fs.unlink(`public${product.imagePath}`)

  revalidatePath("/")
  revalidatePath("/products")
}
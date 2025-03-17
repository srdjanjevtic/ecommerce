import prisma from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe"
import { CheckoutForm } from "./_components/CheckoutForm"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
import type { InferGetStaticPropsType } from 'next';

export async function getStaticProps() {
  // Return the props for the page
  return {
    props: {
            params: {
        id: '',
      },
    },
  };
}

export default async function PurchasePage({
  params: { id },
}: InferGetStaticPropsType<typeof getStaticProps>)  {
  
  const product = await prisma.product.findUnique({ where: { id } })
  if (product == null) return notFound()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    metadata: { productId: product.id },
  })

  if (paymentIntent.client_secret == null) {
    throw Error("Stripe failed to create payment intent")
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  )
}
import prisma from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe"
import { CheckoutForm } from "./_components/CheckoutForm"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
// import type { InferGetStaticPropsType } from 'next';
import { GetServerSideProps } from 'next';

interface PageProps {
  params: {
    id: string;
  };
}

export async function getStaticProps() {
  // Return the props for the page
  return Promise.resolve({
    props: {
      params: {
        id: '',
      },
    },
  });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }; // Type assertion
  return {
    props: {
      params: { id },
    },
  };
};

// Corrected function declaration
const PurchasePage: React.FC<PageProps> = async ({ params }) => {
  const product = await prisma.product.findUnique({ where: { id: params.id } }) // Use params.id
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

export default PurchasePage;
import prisma from "@/db/db"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function POST(req: Request) {
  const stripeSignature = req.headers.get("stripe-signature") ?? "";

  if (stripeSignature) {
    const body = await req.text(); // Read the body as text
    const event = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "charge.succeeded") {
      const charge = event.data.object
      const productId = charge.metadata.productId
      const email = charge.billing_details.email
      const pricePaidInCents = charge.amount
  
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (product == null || email == null) {
        return new NextResponse("Bad Request", { status: 400 })
      }
  
      const userFields = {
        email,
        orders: { create: { productId, pricePaidInCents } },
      }
      const {
        orders: [order],
      } = await prisma.user.upsert({
        where: { email },
        create: userFields,
        update: userFields,
        select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
  
      const downloadVerification = await prisma.downloadVerification.create({
        data: {
          productId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        },
      })
  
      await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Order Confirmation",
        react: (
          <PurchaseReceiptEmail
            order={order}
            product={product}
            downloadVerificationId={downloadVerification.id}
          />
        ),
      })
    }
  
    return new NextResponse()
  } else {
    console.error("Missing stripe-signature header");
    return new NextResponse("Bad Request", { status: 400 })
  }
}

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components"
import { OrderInformation } from "./components/OrderInformation"
import React from "react"

type OrderHistoryEmailProps = {
  orders: {
    id: string
    pricePaidInCents: number
    createdAt: Date
    downloadVerificationId: string
    product: {
      name: string
      imagePath: string
      description: string
    }
  }[]
}

// OrderHistoryEmail.PreviewProps = {
//   orders: [
//     {
//       id: crypto.randomUUID(),
//       createdAt: new Date(),
//       pricePaidInCents: 10000,
//       downloadVerificationId: crypto.randomUUID(),
//       product: {
//         name: "Product name",
//         description: "Some description",
//         imagePath:
//           "/products/88f73a67-11b1-423e-b428-41491dcebac3-579126_435079686574208_1269054688_n_435079686574208.jpg",
//       },
//     },
//     {
//       id: crypto.randomUUID(),
//       createdAt: new Date(),
//       pricePaidInCents: 2000,
//       downloadVerificationId: crypto.randomUUID(),
//       product: {
//         name: "Product name 2",
//         description: "Some other desc",
//         imagePath:
//           "/products/d6ec4d85-f777-4962-b048-cdfc62b7eaf7-musaka1.jpg",
//       },
//     },
//   ],
// } satisfies OrderHistoryEmailProps
 
export default async function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
  return (
    <Html>
      <Preview>Order History & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Order History</Heading>
            {await orders.map((order, index) => (
              <React.Fragment key={order.id}>
                <OrderInformation
                  order={order}
                  product={order.product}
                  downloadVerificationId={order.downloadVerificationId}
                />
                {index < orders.length - 1 && <Hr />}
              </React.Fragment>
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
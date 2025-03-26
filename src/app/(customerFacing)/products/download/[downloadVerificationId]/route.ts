import prisma from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
// import fs from "fs/promises"
// import { head, getBlob } from '@vercel/blob';

type Params = Promise<{ downloadVerificationId: string }>

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Params }
) {
  const { downloadVerificationId } = await params;
  const data = await prisma.downloadVerification.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  })


  if (data == null) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  ////////////////  Vercel Blob code ////////////////
 
  // const { size } = await head(data.product.filePath);
  // const extension = data.product.filePath.split(".").pop();

  //   return new NextResponse(data.product.filePath, {
  //   headers: {
  //     "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
  //     "Content-Length": size.toString(),
  //   },
  // })
  return new NextResponse(data.product.filePath, {
  status: 302,
  headers: {
    "Content-Disposition": `attachment; filename="${data.product.name}"`,
  },
});

  /////////////////  NON VERCEL HOBBY CODE  //////////////////
  // const { size } = await fs.stat(data.product.filePath)
  // const file = await fs.readFile(data.product.filePath)
  // const extension = data.product.filePath.split(".").pop()

  // return new NextResponse(file, {
  //   headers: {
  //     "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
  //     "Content-Length": size.toString(),
  //   },
  // })
}
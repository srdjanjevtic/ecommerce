import prisma from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import { head } from '@vercel/blob';

type Params = Promise<{ downloadVerificationId: string }>;

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
  });

  if (data == null) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url));
  }

  // Vercel Blob code
  const { size, url } = await head(data.product.filePath);
  const extension = data.product.filePath.split(".").pop();

  // Return the file for download
  return NextResponse.json({ url }, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}

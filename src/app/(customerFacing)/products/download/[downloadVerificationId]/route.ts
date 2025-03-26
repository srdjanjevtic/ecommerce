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

  const metadata = await head(data.product.filePath);
  const extension = data.product.filePath.split(".").pop();

  // Fetch the blob from the download URL
  const response = await fetch(metadata.downloadUrl);
  const blob = await response.blob();

  // Return the file for download
  return NextResponse.json(blob, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      "Content-Length": metadata.size.toString(),
    },
  });
}

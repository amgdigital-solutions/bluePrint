import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const allowedContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/acad",
  "application/dxf",
  "application/octet-stream",
];

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      const isUserUpload = Boolean(session && pathname.startsWith(`orders/${session.userId}/`));
      const isGuestUpload = !session && pathname.startsWith("orders/guest/");
      if (!isUserUpload && !isGuestUpload) throw new Error("Invalid upload path.");

      return {
        allowedContentTypes,
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: session?.userId || null }),
      };
    },
    onUploadCompleted: async () => {
      // The order API stores the resulting private Blob URL after upload.
    },
  });

  return NextResponse.json(jsonResponse);
}

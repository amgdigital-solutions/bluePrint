import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const allowedContentTypes = [
  "application/pdf",
];

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  const body = await request.json();
  const pathname = typeof body.pathname === "string" ? body.pathname : "";

  const isGuestPath = pathname.startsWith("orders/guest/");
  if (!session && !isGuestPath) {
    return NextResponse.json({ error: "Authentication required for file uploads." }, { status: 401 });
  }
  if (session && !isGuestPath && !pathname.startsWith(`orders/${session.userId}/`)) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 403 });
  }

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      const isUserUpload = Boolean(session && pathname.startsWith(`orders/${session.userId}/`));
      const isGuestUpload = pathname.startsWith("orders/guest/");
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

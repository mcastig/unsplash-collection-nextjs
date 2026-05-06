import { NextResponse } from "next/server";
import { triggerDownload } from "@/lib/unsplash";
import { getPhoto } from "@/lib/unsplash";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const photo = await getPhoto(id);
    await triggerDownload(photo.links.download_location);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

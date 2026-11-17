import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/apiAuth";
import { r2, bucketName, publicUrl } from "@/lib/r2Client";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  try {
    const listRes = await r2.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: "backups/",
      })
    );

    const backups = (listRes.Contents || [])
      .filter((item) => item.Key?.endsWith(".json"))
      .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
      .map((item) => {
        const key = item.Key || "";
        const fileName = key.replace("backups/", "");
        return {
          key,
          fileName,
          sizeBytes: item.Size || 0,
          sizeKb: Math.round((item.Size || 0) / 1024),
          lastModified: item.LastModified?.toISOString() || "",
          formattedDate: item.LastModified?.toLocaleString("pt-BR") || "",
          url: `${publicUrl}/${key}`,
        };
      });

    return NextResponse.json({ backups });
  } catch (err: any) {
    console.error("Error listing backups from R2:", err);
    return NextResponse.json({ error: err.message, backups: [] }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "@/lib/r2Client";

const FILE_KEY = "database/event_medias.json";

export async function GET() {
  try {
    if (!bucketName) {
      throw new Error("R2_BUCKET_NAME is not configured.");
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: FILE_KEY,
    });

    try {
      const response = await r2.send(command);
      const dataStr = await response.Body?.transformToString();
      
      if (!dataStr) {
        return NextResponse.json([]);
      }

      const data = JSON.parse(dataStr);
      return NextResponse.json(data);
    } catch (getErr: any) {
      // If the file doesn't exist yet, return an empty array
      if (getErr.name === "NoSuchKey" || getErr.name === "NotFound") {
        return NextResponse.json([]);
      }
      throw getErr;
    }
  } catch (error: any) {
    console.error("Error reading event-media from R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!bucketName) {
      throw new Error("R2_BUCKET_NAME is not configured.");
    }

    const data = await request.json();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: FILE_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    });

    await r2.send(command);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing event-media to R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

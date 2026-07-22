import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, bucketName, publicUrl } from "@/lib/r2Client";

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType parameters are required." },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: "R2_BUCKET_NAME is not configured on the server." },
        { status: 500 }
      );
    }

    // Generate unique key for the asset to avoid collisions
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `assets/${Date.now()}-${cleanFileName}`;

    // Create S3 PUT Command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    // Generate presigned URL valid for 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    
    // Construct the public URL of the uploaded asset
    const fileUrl = publicUrl 
      ? `${publicUrl.replace(/\/$/, "")}/${key}` 
      : `https://${bucketName}.r2.cloudflarestorage.com/${key}`;

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error: any) {
    console.error("R2 Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned upload URL.", details: error.message },
      { status: 500 }
    );
  }
}

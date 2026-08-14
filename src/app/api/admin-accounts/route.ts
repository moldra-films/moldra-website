import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "@/lib/r2Client";

const FILE_KEY = "database/admin_accounts.json";

const DEFAULT_ACCOUNTS = [
  { id: "default-1", email: "admin@moldrafilms.com.br", role: "admin", createdAt: new Date().toISOString() }
];

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
        return NextResponse.json(DEFAULT_ACCOUNTS);
      }

      const data = JSON.parse(dataStr);
      return NextResponse.json(data);
    } catch (getErr: any) {
      if (getErr.name === "NoSuchKey" || getErr.name === "NotFound") {
        return NextResponse.json(DEFAULT_ACCOUNTS);
      }
      throw getErr;
    }
  } catch (error: any) {
    console.error("Error reading admin-accounts from R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!bucketName) {
      throw new Error("R2_BUCKET_NAME is not configured.");
    }

    const data = await request.json();
    let accountsToWrite = [];

    if (Array.isArray(data)) {
      accountsToWrite = data;
    } else if (data && typeof data === "object") {
      // It is a single object (e.g. from sign up page)
      // Retrieve the current accounts list from R2 first
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: FILE_KEY,
      });

      let currentAccounts = [...DEFAULT_ACCOUNTS];
      try {
        const response = await r2.send(getCommand);
        const dataStr = await response.Body?.transformToString();
        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          if (Array.isArray(parsed)) {
            currentAccounts = parsed;
          } else if (parsed && typeof parsed === "object") {
            // Auto heal corrupted single object formats
            currentAccounts = [parsed];
          }
        }
      } catch (getErr: any) {
        // NoSuchKey / NotFound is fine, defaults to DEFAULT_ACCOUNTS
        if (getErr.name !== "NoSuchKey" && getErr.name !== "NotFound") {
          throw getErr;
        }
      }

      // Check if this account email already exists in the whitelist to avoid duplicates
      const exists = currentAccounts.some(
        (acc: any) => acc.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!exists) {
        currentAccounts.push(data);
      }
      accountsToWrite = currentAccounts;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: FILE_KEY,
      Body: JSON.stringify(accountsToWrite, null, 2),
      ContentType: "application/json",
    });

    await r2.send(command);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing admin-accounts to R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

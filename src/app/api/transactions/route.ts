import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "@/lib/r2Client";

const FILE_KEY = "database/transactions.json";

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
      if (getErr.name === "NoSuchKey" || getErr.name === "NotFound") {
        return NextResponse.json([]);
      }
      throw getErr;
    }
  } catch (error: any) {
    console.error("Error reading transactions from R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!bucketName) {
      throw new Error("R2_BUCKET_NAME is not configured.");
    }

    const payload = await request.json();

    if (Array.isArray(payload)) {
      // Overwrite database (Admin sync)
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: FILE_KEY,
        Body: JSON.stringify(payload, null, 2),
        ContentType: "application/json",
      });
      await r2.send(putCommand);
      return NextResponse.json({ success: true });
    } else {
      // Append single transaction (Client purchase or manual ledger quick entry)
      let transactions: any[] = [];
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: FILE_KEY,
      });

      try {
        const response = await r2.send(getCommand);
        const dataStr = await response.Body?.transformToString();
        if (dataStr) {
          transactions = JSON.parse(dataStr);
        }
      } catch (getErr: any) {
        if (getErr.name !== "NoSuchKey" && getErr.name !== "NotFound") {
          throw getErr;
        }
      }

      const finalTransaction = {
        ...payload,
        id: transactions.length + 1
      };
      transactions.push(finalTransaction);

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: FILE_KEY,
        Body: JSON.stringify(transactions, null, 2),
        ContentType: "application/json",
      });
      await r2.send(putCommand);
      return NextResponse.json(finalTransaction);
    }
  } catch (error: any) {
    console.error("Error writing transactions to R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

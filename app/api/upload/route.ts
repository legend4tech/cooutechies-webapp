/**
 * S3 Upload API Route
 * Handles file uploads to AWS S3 bucket
 * Accepts files via FormData and returns the public URL
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file exists
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Initialize S3 client with credentials from environment variables
    const s3Client = new S3Client({
      region: process.env.MY_AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY as string,
      },
    });

    // Generate unique filename to prevent collisions
    const fileExtension = file.name.split(".").pop() || "";
    const uniqueFileName = `events/${uuidv4()}.${fileExtension}`;

    // Convert file to buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare S3 upload command
    const command = new PutObjectCommand({
      Bucket: process.env.MY_AWS_S3_BUCKET_NAME as string,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    try {
      // Execute S3 upload
      await s3Client.send(command);
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      return NextResponse.json(
        {
          error: `S3 upload failed: ${
            s3Error instanceof Error ? s3Error.message : String(s3Error)
          }`,
        },
        { status: 500 },
      );
    }

    // Construct public URL for the uploaded file
    const fileUrl = `https://${process.env.MY_AWS_S3_BUCKET_NAME}.s3.${process.env.MY_AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Error in upload API route:", error);
    return NextResponse.json(
      {
        error: `Failed to upload file: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 },
    );
  }
}

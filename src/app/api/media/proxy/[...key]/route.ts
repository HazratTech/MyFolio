import { NextRequest, NextResponse } from "next/server";

const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const STORAGE_API_KEY = process.env.STORAGE_API_KEY;

// Next.js dynamic route [...key] passes params.key as an array of strings
export async function GET(req: NextRequest, { params }: { params: { key: string[] } }) {
    if (!STORAGE_API_KEY) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Join the key segments back into a single string path
    const key = params.key.join('/');

    if (!key) {
        return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // Since we don't know if the bucket is public, and we have an API Key,
    // we should try to sign a download URL or proxy the content.
    // Assuming the external API might have a /file endpoint that serves content or redirects.

    // Attempt 1: Check if we can get a presigned GET url from the external API
    // (This works if the external API supports it, otherwise we might need to proxy)

    // Attempt 2: Direct Proxy.
    // Fetch from external API's public URL might fail if private.
    // Fetch using API Key?

    try {
        // Attempt 1: Fetch from /file endpoint (Standard REST pattern matching DELETE /file)
        const fileRes = await fetch(`${STORAGE_API_URL}/file?key=${key}&bucket=myfolio`, {
            headers: { "Authorization": STORAGE_API_KEY }
        });

        if (fileRes.ok) {
            const contentType = fileRes.headers.get("Content-Type");

            // Case A: API returns JSON (likely containing a signed URL)
            if (contentType && contentType.includes("application/json")) {
                const data = await fileRes.json();
                if (data.url) {
                    return NextResponse.redirect(data.url);
                }
            }

            // Case B: API returns the file content directly (Proxy the stream)
            // This allows us to serve private files effectively using our server's auth.
            return new NextResponse(fileRes.body, {
                status: 200,
                headers: {
                    "Content-Type": contentType || "application/octet-stream",
                    "Cache-Control": "public, max-age=31536000, immutable"
                }
            });
        }

        console.error(`Proxy: /file failed with ${fileRes.status} ${fileRes.statusText}`);

        // Fallback: If API fetch failed, try the public URL pattern one last time
        const fallbackUrl = `${STORAGE_API_URL}/myfolio/${key}`;
        return NextResponse.redirect(fallbackUrl);

    } catch (e) {
        console.error("Proxy handler failed", e);
    }

    return new NextResponse("Image not found", { status: 404 });
}

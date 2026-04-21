"use server";

const STORAGE_API_URL = "https://api-minio-storage.hazratdev.top";
const STORAGE_API_KEY = process.env.STORAGE_API_KEY;

if (!STORAGE_API_KEY) {
    console.error("STORAGE_API_KEY is not defined in environment variables.");
}

export async function getPresignedUrl(fileType: string, fileSize: number, bucket: string = "myfolio") {
    if (!STORAGE_API_KEY) throw new Error("Server configuration error: Missing API Key");

    try {
        const res = await fetch(`${STORAGE_API_URL}/upload/init`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": STORAGE_API_KEY,
            },
            body: JSON.stringify({
                filename: `upload-${Date.now()}`, // Temporary filename, backend might rename
                file_type: fileType,
                file_size: fileSize,
                bucket: bucket,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("MinIO Init Error:", errorText);
            throw new Error(`Failed to init upload: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("getPresignedUrl error:", error);
        throw error;
    }
}

export async function completeUpload(objectKey: string, fileSize: number, fileType: string, bucket: string = "myfolio") {
    if (!STORAGE_API_KEY) throw new Error("Server configuration error: Missing API Key");

    try {
        const res = await fetch(`${STORAGE_API_URL}/upload/complete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": STORAGE_API_KEY,
            },
            body: JSON.stringify({
                object_key: objectKey,
                file_size: fileSize,
                file_type: fileType,
                bucket: bucket,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("MinIO Complete Error:", errorText);
            throw new Error(`Failed to complete upload: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("completeUpload error:", error);
        throw error;
    }
}

export async function uploadFromUrl(url: string, bucket: string = "myfolio") {
    if (!STORAGE_API_KEY) throw new Error("Server configuration error: Missing API Key");

    try {
        // 1. Fetch the image
        const imageRes = await fetch(url);
        if (!imageRes.ok) throw new Error(`Failed to fetch image from URL: ${imageRes.statusText}`);

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileType = imageRes.headers.get("content-type") || "image/jpeg";
        const fileSize = buffer.length;

        // 2. Init Upload
        const initData = await getPresignedUrl(fileType, fileSize, bucket);
        const { upload_url, object_key } = initData;

        // 3. Upload to MinIO (using the presigned URL)
        const uploadRes = await fetch(upload_url, {
            method: "PUT",
            headers: {
                "Content-Type": fileType,
            },
            body: buffer,
        });

        if (!uploadRes.ok) {
            // Note: MinIO/S3 presigned PUTs might return XML errors on failure
            const errText = await uploadRes.text();
            console.error("Presigned Upload Error:", errText);
            throw new Error(`Failed to upload data to storage: ${uploadRes.statusText}`);
        }

        // 4. Complete Upload
        await completeUpload(object_key, fileSize, fileType, bucket);

        // Force Public URL construction (Since user confirmed bucket is public)
        // This avoids storing expiring signed URLs returned by the API
        const publicUrl = `${STORAGE_API_URL}/${bucket}/${object_key}`;

        return { final_url: publicUrl, object_key: object_key };
    } catch (error) {
        console.error("uploadFromUrl error:", error);
        throw error;
    }
}
export async function deleteFile(objectKey: string, bucket: string = "myfolio") {
    if (!STORAGE_API_KEY) throw new Error("Server configuration error: Missing API Key");

    try {
        const res = await fetch(`${STORAGE_API_URL}/file`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": STORAGE_API_KEY,
            },
            body: JSON.stringify({
                object_key: objectKey,
                bucket: bucket,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("MinIO Delete Error:", errorText);
            throw new Error(`Failed to delete file: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error("deleteFile error:", error);
        throw error;
    }
}

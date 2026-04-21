import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Media from "@/models/Media";
import { deleteFile } from "@/app/actions/upload";

// GET: List all media files
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.filename = { $regex: search, $options: "i" };
        }

        const files = await Media.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Media.countDocuments(query);

        return NextResponse.json({
            files,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error("Failed to fetch media:", error);
        return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
}

// POST: Register a new uploaded file
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();

        // Basic validation
        if (!body.key || !body.url || !body.filename) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newFile = await Media.create(body);
        return NextResponse.json(newFile, { status: 201 });
    } catch (error) {
        console.error("Failed to register media:", error);
        return NextResponse.json({ error: "Failed to register media" }, { status: 500 });
    }
}

// PATCH: Update file details (e.g. alt text)
export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Prevent updating critical fields
        delete updates.key;
        delete updates.url;
        delete updates.size;
        delete updates.mimeType;

        const updatedFile = await Media.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedFile) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        return NextResponse.json(updatedFile);
    } catch (error) {
        console.error("Failed to update media:", error);
        return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
    }
}

// DELETE: Delete a file
export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const file = await Media.findById(id);
        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // 1. Delete from MinIO
        // Note: deleteFile action usually runs on server, but here we are already on server.
        // If deleteFile is a server action, it can be called directly.
        await deleteFile(file.key);

        // 2. Delete from DB
        await Media.findByIdAndDelete(id);

        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Failed to delete media:", error);
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}

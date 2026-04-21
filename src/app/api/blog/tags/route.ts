import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tag from "@/models/Tag";
import { slugify } from "@/lib/utils";

export async function GET() {
    try {
        await dbConnect();
        const tags = await Tag.find({}).sort({ name: 1 });
        return NextResponse.json(tags);
    } catch (error) {
        console.error("Failed to fetch tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = slugify(body.name);

        const tag = await Tag.create({
            name: body.name,
            slug
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error("Failed to create tag:", error);
        return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
    }
}

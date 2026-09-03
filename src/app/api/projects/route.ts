import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Comment from '@/models/Comment';

export async function GET() {
    await dbConnect();
    try {
        const projects = await Project.find({}).sort({ id: 1 });

        // Add comment count to each project
        const projectsWithCounts = await Promise.all(projects.map(async (project) => {
            const count = await Comment.countDocuments({ projectId: project._id.toString() });
            return { ...project.toObject(), commentCount: count };
        }));

        return NextResponse.json(projectsWithCounts, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const project = await Project.create(body);
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

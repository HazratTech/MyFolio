"use client";

import MediaLibrary from "@/components/admin/MediaLibrary";

export default function AdminMediaPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold font-heading">
                Media Library
            </h1>
            <p className="text-muted-foreground">Manage your uploaded images and assets.</p>

            <MediaLibrary />
        </div>
    );
}

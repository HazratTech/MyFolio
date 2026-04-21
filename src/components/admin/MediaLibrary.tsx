"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, Trash2, Search, Check, ImageIcon } from "lucide-react";
import { getPresignedUrl, completeUpload, deleteFile } from "@/app/actions/upload";
import { IMedia } from "@/models/Media";
import { cn } from "@/lib/utils";

interface MediaLibraryProps {
    onSelect?: (media: IMedia) => void;
    selectionMode?: boolean;
}

export default function MediaLibrary({ onSelect, selectionMode = false }: MediaLibraryProps) {
    const [files, setFiles] = useState<IMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedFile, setSelectedFile] = useState<IMedia | null>(null);

    useEffect(() => {
        fetchFiles();
    }, [search]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/media?search=${search}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files);
            }
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            // 1. Get Presigned URL
            const { upload_url, object_key } = await getPresignedUrl(file.type, file.size);

            // 2. Upload to MinIO
            await fetch(upload_url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            // 3. Complete Upload
            const { final_url } = await completeUpload(object_key, file.size, file.type);

            // 4. Register in DB
            const mediaData = {
                filename: file.name,
                url: final_url,
                key: object_key,
                mimeType: file.type,
                size: file.size,
                altText: file.name.split('.')[0]
            };

            const res = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mediaData),
            });

            if (res.ok) {
                const newFile = await res.json();
                setFiles([newFile, ...files]);
                if (selectionMode) {
                    setSelectedFile(newFile);
                }
            }
        } catch (error) {
            console.error("Failed to upload:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const handleDelete = async (file: IMedia) => {
        if (!confirm("Are you sure you want to permanently delete this file? This cannot be undone and may break posts using it.")) return;

        try {
            const res = await fetch(`/api/media?id=${file._id}`, { method: "DELETE" });
            if (res.ok) {
                setFiles(files.filter(f => f._id !== file._id));
                if (selectedFile?._id === file._id) setSelectedFile(null);
            } else {
                alert("Failed to delete file");
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Failed to delete file");
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-full bg-background overflow-hidden",
            !selectionMode && "rounded-lg border border-border"
        )}>
            {/* Toolbar - Header, Full Width */}
            <div className="p-3 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 shrink-0">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-9 bg-background h-9 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <Button
                        onClick={() => document.getElementById('media-upload')?.click()}
                        disabled={uploading}
                        className="w-full sm:w-auto h-9"
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                    </Button>
                </div>
            </div>

            {/* Main Layout: Grid + Sidebar */}
            <div className="flex-1 flex min-h-0">

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 bg-muted/5">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed border-muted m-4">
                            <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                            <p>No media found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 p-4 content-start">
                            {files.map((file) => (
                                <div
                                    key={file._id}
                                    onClick={() => setSelectedFile(file)}
                                    className={cn(
                                        "group relative aspect-square rounded-3xl overflow-hidden border cursor-pointer transition-all bg-background shadow-sm hover:shadow-md",
                                        selectedFile?._id === file._id
                                            ? "ring-2 ring-primary border-primary ring-offset-2"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <Image
                                        src={file.url}
                                        alt={file.altText || file.filename}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                    />
                                    {selectedFile?._id === file._id && (
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm z-10">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs text-white truncate font-medium">{file.filename}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                {selectedFile && (
                    <div className="w-80 border-l border-border bg-background flex flex-col overflow-hidden shrink-0 shadow-xl z-20">
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/20 border border-border mb-6 shrink-0">
                                <Image
                                    src={selectedFile.url}
                                    alt={selectedFile.altText || ""}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1 pb-4 border-b border-border">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Name</label>
                                        <Input
                                            value={selectedFile.filename}
                                            onChange={(e) => setSelectedFile({ ...selectedFile, filename: e.target.value })}
                                            className="h-8 font-medium bg-muted/30"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">
                                        {new Date(selectedFile.createdAt).toLocaleDateString()}
                                        {" • "}
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alt Text</label>
                                        <Input
                                            value={selectedFile.altText || ''}
                                            onChange={(e) => setSelectedFile({ ...selectedFile, altText: e.target.value })}
                                            className="h-9 text-sm bg-muted/30"
                                            placeholder="Describe this image for SEO"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Caption</label>
                                        <Input
                                            value={selectedFile.caption || ''}
                                            onChange={(e) => setSelectedFile({ ...selectedFile, caption: e.target.value })}
                                            className="h-9 text-sm bg-muted/30"
                                            placeholder="Visible caption for the image"
                                        />
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="w-full h-8"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/media', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: selectedFile._id,
                                                        altText: selectedFile.altText,
                                                        caption: selectedFile.caption,
                                                        filename: selectedFile.filename
                                                    })
                                                });

                                                if (res.ok) {
                                                    const updatedFile = await res.json();
                                                    // Update local list
                                                    setFiles(files.map(f => f._id === updatedFile._id ? updatedFile : f));
                                                    alert("Saved!");
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to save");
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Public URL</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={selectedFile.url}
                                            readOnly
                                            className="h-8 text-xs bg-muted/50 font-mono"
                                        />
                                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => {
                                            navigator.clipboard.writeText(selectedFile.url);
                                            alert('Copied!');
                                        }}>
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Actions Footer */}
                        <div className="p-4 border-t border-border bg-muted/10 space-y-3 shrink-0">
                            {selectionMode && onSelect ? (
                                <Button className="w-full shadow-md" onClick={() => onSelect(selectedFile)}>
                                    Insert Selected
                                </Button>
                            ) : null}

                            <Button
                                variant="destructive"
                                className="w-full opacity-90 hover:opacity-100"
                                size="sm"
                                onClick={() => handleDelete(selectedFile)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MediaLibrary from "@/components/admin/MediaLibrary";
import { IMedia } from "@/models/Media";
import { useState } from "react";

interface MediaPickerModalProps {
    children: React.ReactNode;
    onSelect: (media: IMedia) => void;
}

export default function MediaPickerModal({ children, onSelect }: MediaPickerModalProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (media: IMedia) => {
        onSelect(media);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[700px] p-0 overflow-hidden bg-background flex flex-col">
                <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider">Select Media</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                    <MediaLibrary selectionMode onSelect={handleSelect} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

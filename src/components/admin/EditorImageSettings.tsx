import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface EditorImageSettingsProps {
    editor: Editor | null;
}

export default function EditorImageSettings({ editor }: EditorImageSettingsProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [alt, setAlt] = useState('');
    const [width, setWidth] = useState('');

    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            // @ts-ignore - node property exists on NodeSelection
            const isImage = editor.isActive('image') || editor.state.selection.node?.type.name === 'image';
            setIsVisible(isImage);

            if (isImage) {
                const attrs = editor.getAttributes('image');
                setAlt(attrs.alt || '');
                setWidth(attrs.width || '');
            }
        };

        editor.on('selectionUpdate', updateState);
        editor.on('update', updateState);
        editor.on('transaction', updateState);

        // Initial check
        updateState();

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('update', updateState);
            editor.off('transaction', updateState);
        };
    }, [editor]);

    const updateImage = () => {
        if (editor) {
            editor.commands.updateAttributes('image', {
                alt: alt,
                width: width
            });
        }
    };

    if (!isVisible) return null;

    return (
        <Card className="bg-white border-slate-200/90 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wider text-slate-500">
                    <ImageIcon className="w-4 h-4" /> Image Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Description (Alt Text)</label>
                    <Input
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        placeholder="Detailed description for SEO..."
                        className="bg-white border-slate-200 text-slate-900 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Dimensions</label>
                    <Input
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="e.g. 100% or 500px"
                        className="bg-white border-slate-200 text-slate-900 text-sm"
                    />
                </div>
                <Button onClick={updateImage} className="w-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                    Apply Changes
                </Button>
            </CardContent>
        </Card>
    );
}

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, Code, Terminal, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getPresignedUrl, completeUpload } from "@/app/actions/upload";
import { useState, useRef } from 'react';
import MediaPickerModal from "@/components/admin/MediaPickerModal";

// @ts-ignore
import TextAlign from '@tiptap/extension-text-align';
// @ts-ignore
import ResizeImage from 'tiptap-extension-resize-image';
// @ts-ignore
import { all, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const lowlight = createLowlight(all);

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    onEditorReady?: (editor: any) => void;
}

const TiptapEditor = ({ content, onChange, onEditorReady }: TiptapEditorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                code: {
                    HTMLAttributes: {
                        class: 'bg-zinc-800 rounded px-1.5 py-0.5 font-mono text-sm text-emerald-400',
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-outside ml-4',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-outside ml-4',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-primary pl-4 italic bg-muted/50 p-2 rounded-r',
                    },
                },
                codeBlock: false, // Disable default CodeBlock
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-100',
                },
            }),
            ResizeImage.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg object-cover',
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) {
                onEditorReady(editor);
            }
        },
        editorProps: {
            attributes: {
                class: 'blog-prose max-w-4xl mx-auto focus:outline-none min-h-[500px] outline-none py-12 px-6 md:px-12',
            },
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    const getActiveStyle = () => {
        if (editor.isActive('heading', { level: 1 })) return 'h1';
        if (editor.isActive('heading', { level: 2 })) return 'h2';
        if (editor.isActive('heading', { level: 3 })) return 'h3';
        if (editor.isActive('heading', { level: 4 })) return 'h4';
        if (editor.isActive('heading', { level: 5 })) return 'h5';
        return 'p';
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        let url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Automatically prepend https:// if it's missing to avoid relative path routing
        if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url) && !/^tel:/i.test(url) && !url.startsWith('/') && !url.startsWith('#')) {
            url = 'https://' + url;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const { upload_url, object_key } = await getPresignedUrl(file.type, file.size);
            await fetch(upload_url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            await completeUpload(object_key, file.size, file.type);
            const final_url = `https://api-minio-storage.hazratdev.top/myfolio/${object_key}`;

            if (final_url) {
                const alt = window.prompt("Enter image description (Alt Text):", file.name.split('.')[0]);
                editor.chain().focus().setImage({
                    src: final_url,
                    alt: alt || file.name,
                    // @ts-ignore
                    width: 600
                }).run();
            }

        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card relative group shadow-sm">
            <style>{`
                .hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
                .hljs-doctag, .hljs-keyword, .hljs-formula { color: #c678dd; }
                .hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst { color: #e06c75; }
                .hljs-literal { color: #56b6c2; }
                .hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string { color: #98c379; }
                .hljs-built_in, .hljs-class .hljs-title { color: #e6c07b; }
                .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number { color: #d19a66; }
                .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title { color: #61aeee; }
                .hljs-emphasis { font-style: italic; }
                .hljs-strong { font-weight: bold; }
                .hljs-link { text-decoration: underline; }
            `}</style>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
            />

            {/* Bubble Menu for formatting text */}
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-zinc-950 border border-zinc-800 shadow-2xl rounded-full overflow-hidden p-1 gap-1 items-center">
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('bold') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('italic') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('strike') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('code') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('link') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={setLink}><LinkIcon className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'left' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'center' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'right' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8 text-white hover:bg-white/10 rounded-full'} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></Button>
            </BubbleMenu>

            {/* Full Top Toolbar */}
            <div className="flex flex-wrap gap-2 p-2 border-b border-border bg-muted/40 items-center sticky top-0 z-10">
                {/* Text Style */}
                <Select
                    value={getActiveStyle()}
                    onValueChange={(value) => {
                        switch (value) {
                            case 'h1': editor.chain().focus().setHeading({ level: 1 }).run(); break;
                            case 'h2': editor.chain().focus().setHeading({ level: 2 }).run(); break;
                            case 'h3': editor.chain().focus().setHeading({ level: 3 }).run(); break;
                            case 'h4': editor.chain().focus().setHeading({ level: 4 }).run(); break;
                            case 'h5': editor.chain().focus().setHeading({ level: 5 }).run(); break;
                            case 'p': editor.chain().focus().setParagraph().run(); break;
                        }
                    }}
                >
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border focus:ring-0 shadow-none">
                        <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p">Normal</SelectItem>
                        <SelectItem value="h1" className="font-bold text-xl">Heading 1</SelectItem>
                        <SelectItem value="h2" className="font-bold text-lg">Heading 2</SelectItem>
                        <SelectItem value="h3" className="font-bold text-base">Heading 3</SelectItem>
                        <SelectItem value="h4" className="font-bold text-sm uppercase">Heading 4</SelectItem>
                        <SelectItem value="h5" className="font-bold text-xs uppercase">Heading 5</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Basic Formatting */}
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('bold') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('italic') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('strike') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('code') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="w-4 h-4" /></Button>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Alignment */}
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'left' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'center' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'right' }) ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></Button>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Lists & Quotes */}
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('bulletList') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('orderedList') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('blockquote') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></Button>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Code Block & Language */}
                <div className="flex bg-muted rounded-md p-0.5 gap-1 items-center">
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('codeBlock') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Terminal className="w-4 h-4" /></Button>

                    {editor.isActive('codeBlock') && (
                        <Select 
                            value={editor.getAttributes('codeBlock').language || 'ansi'} 
                            onValueChange={(lang) => editor.chain().focus().updateAttributes('codeBlock', { language: lang }).run()}
                        >
                            <SelectTrigger className="w-[100px] h-8 text-xs bg-transparent border-0 focus:ring-0 shadow-none">
                                <SelectValue placeholder="Lang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ansi">Plain</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="javascript">JS</SelectItem>
                                <SelectItem value="typescript">TS</SelectItem>
                                <SelectItem value="kotlin">Kotlin</SelectItem>
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="css">CSS</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="bash">Bash</SelectItem>
                                <SelectItem value="sql">SQL</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Media & Links */}
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className={editor.isActive('link') ? 'bg-white/10 text-primary h-8 w-8' : 'h-8 w-8'} onClick={setLink}><LinkIcon className="w-4 h-4" /></Button>
                    <MediaPickerModal onSelect={(media) => {
                        editor.chain().focus().setImage({
                            src: media.url,
                            alt: media.altText || media.filename,
                            width: 600
                        } as any).run();
                    }}>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><ImageIcon className="w-4 h-4" /></Button>
                    </MediaPickerModal>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Undo/Redo */}
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5 ml-auto">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}><Undo className="w-4 h-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}><Redo className="w-4 h-4" /></Button>
                </div>
            </div>

            <div className="bg-muted/30 p-4 md:p-8 border-t border-border/50">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-border/50 max-w-5xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};

export default TiptapEditor;

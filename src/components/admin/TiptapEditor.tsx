import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, Code, Terminal, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Loader2, Check, AlignLeft, AlignCenter, AlignRight, FileJson, FileCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { getPresignedUrl, completeUpload } from "@/app/actions/upload";
import { useState, useRef, useEffect } from 'react';
import MediaPickerModal from "@/components/admin/MediaPickerModal";

// @ts-ignore
import TextAlign from '@tiptap/extension-text-align';
// @ts-ignore
import ResizeImage from 'tiptap-extension-resize-image';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
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

// Custom extension to handle Tab key in code blocks
const CustomCodeBlockLowlight = CodeBlockLowlight.extend({
    addKeyboardShortcuts() {
        return {
            ...this.parent?.(),
            Tab: () => {
                if (this.editor.isActive('codeBlock')) {
                    this.editor.commands.insertContent('  '); // Insert 2 spaces
                    return true;
                }
                return false;
            },
        }
    }
});

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    onEditorReady?: (editor: any) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) {
        return null;
    }

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

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const setLanguage = (lang: string) => {
        editor.chain().focus().updateAttributes('codeBlock', { language: lang }).run();
    };
    const isCodeBlock = editor.isActive('codeBlock');
    const currentLang = isCodeBlock ? editor.getAttributes('codeBlock').language || 'ansi' : 'ansi';


    return (
        <div className="flex flex-wrap gap-2 p-2 border-b border-white/10 bg-white/5 rounded-t-lg items-center">
            {/* ... Hidden Input ... */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
            />

            {/* Text Style */}
            <Select
                value={
                    editor.isActive('heading', { level: 1 }) ? 'h1' :
                        editor.isActive('heading', { level: 2 }) ? 'h2' :
                            editor.isActive('heading', { level: 3 }) ? 'h3' :
                                editor.isActive('heading', { level: 4 }) ? 'h4' :
                                    editor.isActive('heading', { level: 5 }) ? 'h5' :
                                        'p'
                }
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
                <SelectTrigger className="w-[120px] h-7 text-xs bg-transparent border-0 focus:ring-0 px-2 shadow-none hover:bg-white/10 text-muted-foreground data-[state=open]:bg-white/10">
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
            <div className="flex bg-white/5 rounded-md p-1 gap-1">
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('bold') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('italic') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('strike') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('code') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="w-4 h-4" /></Button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Alignment */}
            <div className="flex bg-white/5 rounded-md p-1 gap-1">
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'left' }) ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'center' }) ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive({ textAlign: 'right' }) ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></Button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Lists & Quotes */}
            <div className="flex bg-white/5 rounded-md p-1 gap-1">
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('bulletList') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('orderedList') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('blockquote') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></Button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Code Block & Language */}
            <div className="flex bg-white/5 rounded-md p-1 gap-1 items-center">
                <Button type="button" variant="ghost" size="icon" className={isCodeBlock ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Terminal className="w-4 h-4" /></Button>

                {isCodeBlock && (
                    <Select value={currentLang} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[100px] h-7 text-xs bg-transparent border-0 focus:ring-0 px-2 shadow-none hover:bg-white/10">
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
            <div className="flex bg-white/5 rounded-md p-1 gap-1">
                <Button type="button" variant="ghost" size="icon" className={editor.isActive('link') ? 'bg-primary/20 text-primary h-7 w-7' : 'h-7 w-7'} onClick={setLink}><LinkIcon className="w-4 h-4" /></Button>
                <MediaPickerModal onSelect={(media) => {
                    editor.chain().focus().setImage({
                        src: media.url,
                        alt: media.altText || media.filename,
                        // @ts-ignore
                        width: 600
                    }).run();
                }}>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><ImageIcon className="w-4 h-4" /></Button>
                </MediaPickerModal>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Undo/Redo */}
            <div className="flex bg-white/5 rounded-md p-1 gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}><Undo className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}><Redo className="w-4 h-4" /></Button>
            </div>
        </div>
    );
};

const TiptapEditor = ({ content, onChange, onEditorReady }: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu',
            }),
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
            // Add Text Align Extension
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
                autolink: false,
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
                class: 'prose prose-invert max-w-none focus:outline-none p-4 min-h-[300px] prose-pre:!bg-zinc-950 prose-pre:!text-zinc-100 prose-pre:!border prose-pre:!border-white/10 prose-img:my-4 prose-p:!my-2',
            },
        },
        immediatelyRender: false,
    });

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 relative">
            <style>{`
                /* Syntax Highlighting (Atom One Dark inspired) */
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
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;

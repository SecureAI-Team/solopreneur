
'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    Heading1, Heading2, Link as LinkIcon, Image as ImageIcon,
    Undo, Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUploader } from '@/components/upload/file-uploader';

interface RichEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichEditor({
    content = '',
    onChange,
    placeholder = '开始创作你的内容...',
    className
}: RichEditorProps) {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const isInternalChange = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    const addLink = useCallback(() => {
        const url = window.prompt('输入链接URL');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    // Sync external content changes to editor
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Avoid cursor jumping on every keystroke by only updating when content truly differs
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn('border rounded-lg bg-background', className)}>
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-1 border-b p-2">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(editor.isActive('bold') && 'bg-muted')}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(editor.isActive('italic') && 'bg-muted')}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={cn(editor.isActive('strike') && 'bg-muted')}>
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}>
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}>
                    <Heading2 className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(editor.isActive('bulletList') && 'bg-muted')}>
                    <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(editor.isActive('orderedList') && 'bg-muted')}>
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button variant="ghost" size="sm" onClick={addLink}>
                    <LinkIcon className="h-4 w-4" />
                </Button>

                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>插入图片</DialogTitle>
                        </DialogHeader>
                        <FileUploader
                            type="image"
                            onUploadSuccess={(url) => {
                                editor.chain().focus().setImage({ src: url }).run();
                                setIsImageDialogOpen(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>

                <div className="flex-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* 编辑区域 */}
            <EditorContent editor={editor} />

            {/* 气泡菜单 */}
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={cn('h-8', editor.isActive('bold') && 'bg-muted')}>
                            <Bold className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn('h-8', editor.isActive('italic') && 'bg-muted')}>
                            <Italic className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={addLink} className="h-8">
                            <LinkIcon className="h-3 w-3" />
                        </Button>
                    </div>
                </BubbleMenu>
            )}
        </div>
    );
}

export default RichEditor;

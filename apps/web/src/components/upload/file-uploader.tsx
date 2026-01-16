
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Assuming react-dropzone is available or we use native
import { Upload, X, FileIcon, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploaderProps {
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
    onUploadSuccess: (url: string, file: File) => void;
    className?: string;
    type?: 'image' | 'video' | 'all';
}

export function FileUploader({
    accept,
    maxSize = 50 * 1024 * 1024, // 50MB default
    onUploadSuccess,
    className,
    type = 'all'
}: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [preview, setPreview] = useState<string | null>(null);

    const handleUpload = async (fileToUpload: File) => {
        setStatus('uploading');
        setProgress(0);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            // Simulated fake progress
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return 90;
                    return prev + 10;
                });
            }, 200);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload');

            // Note: Next.js API routes don't easily support xhr upload progress without custom config, 
            // so we rely on the fetch promise or simulated progress for MVP. 
            // For better UX, we'd use axios or similar.

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(interval);
            setProgress(100);

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            if (data.success) {
                setStatus('success');
                onUploadSuccess(data.data.url, fileToUpload);
                toast.success('上传成功');
            } else {
                throw new Error(data.error || '上传失败');
            }

        } catch (error: any) {
            setStatus('error');
            toast.error(error.message);
            setFile(null);
            setPreview(null);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selected = acceptedFiles[0];
        if (!selected) return;

        if (selected.size > maxSize) {
            toast.error(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
            return;
        }

        setFile(selected);

        if (selected.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(selected);
        } else if (selected.type.startsWith('video/')) {
            // Create video preview?
        }

        handleUpload(selected);
    }, [maxSize]);

    // Simple native drag & drop implementation to avoid deps issues if react-dropzone missing
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            onDrop([droppedFile]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onDrop([e.target.files[0]]);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setStatus('idle');
        setProgress(0);
    };

    if (file && status === 'success') {
        return (
            <div className={cn("relative rounded-lg border border-border p-4 flex items-center gap-4 bg-muted/30", className)}>
                {preview ? (
                    <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                ) : (
                    <div className="h-16 w-16 bg-background rounded-md flex items-center justify-center border">
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button variant="ghost" size="icon" onClick={clearFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer",
                status === 'uploading' && "opacity-50 pointer-events-none",
                className
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input')?.click()}
        >
            <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : undefined}
                onChange={handleFileSelect}
            />

            {status === 'uploading' ? (
                <div className="space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm font-medium">正在上传... {progress}%</p>
                    <Progress value={progress} className="w-1/2 mx-auto h-2" />
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">点击或拖拽文件到此处上传</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {type === 'image' ? '支持 JPG, PNG, GIF' : type === 'video' ? '支持 MP4, MOV' : '支持多种格式'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

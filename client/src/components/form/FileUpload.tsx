import React, { useCallback, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File | null) => void;
  preview?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSizeMB = 5,
  onFile,
  preview = false,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (f: File) => {
    setError(null);
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setFile(f);
    onFile(f);
    if (preview && f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onFile(null);
  };

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-aura/30 transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-orchid/30 hover:bg-aura"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-primary" />
            <p className="text-sm text-charcoal-muted">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-charcoal-muted mt-1">
              {accept ? `Accepts ${accept}` : "Any file"} up to {maxSizeMB}MB
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={accept} 
            onChange={handleChange} 
          />
        </label>
      ) : (
        <div className="relative border border-orchid/20 rounded-xl p-4 flex items-center gap-4 bg-white">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-orchid/10" />
          ) : (
            <div className="w-16 h-16 bg-aura rounded-lg flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-charcoal-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">{file.name}</p>
            <p className="text-xs text-charcoal-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-2 text-charcoal-muted hover:text-error hover:bg-error/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
};

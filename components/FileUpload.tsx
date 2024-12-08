import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
}

export function FileUpload({ onFileAccepted }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({ description: 'Please upload an Excel file (.xlsx or .xls)' });
        return;
      }
      setUploadedFile(file);
      onFileAccepted(file);
      toast({ description: 'File uploaded successfully!' });
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 animate-fadeIn',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        {uploadedFile ? (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <div className="flex items-center justify-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{uploadedFile.name}</span>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drop your Excel file here
              </p>
              <p className="mt-1 text-sm text-gray-500">
                or click to browse
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
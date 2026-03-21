import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { useDatasetStore } from '../../../features/datasets/store';
import { datasetService } from '../../../features/datasets/api/datasets.service';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadZoneProps {
  onSuccess: (data: any) => void;
}

export const FileUploadZone = ({ onSuccess }: FileUploadZoneProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { setUploadProgress, uploadProgress, setValidationData } = useDatasetStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (f: File | null) => {
    if (f && (f.name.endsWith('.csv') || f.name.match(/\.xlsx?$/i))) {
      setFile(f);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    let processedFile = file;

    // Excel Transliteration Interceptor Model
    if (file.name.match(/\.xlsx?$/i)) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        processedFile = new File([csvOutput], file.name.replace(/\.xlsx?$/i, '.csv'), { type: 'text/csv' });
      } catch (err) {
        console.error("Failed to parse Excel workbook cleanly:", err);
        setIsUploading(false);
        return;
      }
    }

    useDatasetStore.getState().setActiveFile(processedFile);

    // Read headers locally
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      let extractedColumns: string[] = [];

      // Scan aggressively down the file to skip blank rows or stray title text
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const rawCols = line.split(',');
        const cols = rawCols.map(c => c.trim().replace(/^"|"$/g, ''));
        const nonEmptyCols = cols.filter(c => c.length > 0);
        
        // At least 3 populated values means we reliably hit the structural headers
        // (Since validation requires 7 fields anyway, 3 is an extremely generous floor)
        if (nonEmptyCols.length >= 3) {
          extractedColumns = cols;
          break;
        }
      }
      
      if (extractedColumns.length > 0) {
         setValidationData({ columns: extractedColumns, suggestions: {} });
      } else {
         console.error("Critical failure: Could not discover any structural header row in the provided file.");
      }
      
      setIsUploading(false);
      onSuccess({ id: 'active-upload-session' });
    };
    
    reader.onerror = () => {
      console.error('File reading failed');
      setIsUploading(false);
    };
    
    reader.readAsText(processedFile);
  };

  const sizeLabel = file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-navy">Upload Your Dataset</h2>
        <p className="text-content-secondary mt-1 text-sm">
          Drop a CSV or Excel (.xlsx) file and our AI will automatically analyze your logistics process.
        </p>
      </div>

      {/* Drop Zone */}
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            className={`
              relative w-full border-2 border-dashed rounded-2xl p-16 flex flex-col items-center gap-4
              cursor-pointer transition-all duration-300
              ${isDragOver
                ? 'border-orange bg-orange-50/30 scale-[1.01] shadow-md shadow-orange/10'
                : 'border-border hover:border-orange/40 hover:bg-orange-50/10'
              }
            `}
          >
            <input
              type="file"
              className="hidden"
              accept=".csv, .xls, .xlsx"
              onChange={e => handleFile(e.target.files?.[0] || null)}
            />

            <motion.div
              animate={isDragOver ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`p-5 rounded-2xl transition-colors ${isDragOver ? 'bg-orange text-white shadow-md shadow-orange/30' : 'bg-orange-50 text-orange'}`}
            >
              <Upload className="w-10 h-10" />
            </motion.div>

            <div className="text-center">
              <p className="font-bold text-navy text-lg">
                {isDragOver ? 'Release to upload' : 'Drag & drop your CSV here'}
              </p>
              <p className="text-sm text-content-secondary mt-1">
                or <span className="text-orange font-semibold underline underline-offset-2">click to browse</span>
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-content-muted uppercase tracking-wider font-semibold">
              <div className="h-px w-12 bg-border" />
              CSV files only · max 50 MB
              <div className="h-px w-12 bg-border" />
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full p-5 border border-border rounded-2xl bg-white flex items-center gap-4 shadow-card"
          >
            <div className="p-3 bg-navy-50 rounded-xl text-navy shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy truncate">{file.name}</p>
              <p className="text-xs text-content-muted mt-0.5">{sizeLabel} · Ready to analyze</p>
            </div>
            <div className="p-1.5 bg-success-50 rounded-full text-success shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-2 hover:bg-danger-50 text-content-muted hover:text-danger rounded-xl transition-all duration-200 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-xs font-semibold text-content-secondary">
              <span>Uploading to AI engine...</span>
              <span className="text-orange">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
              <motion.div
                className="bg-gradient-to-r from-orange to-orange-light h-full rounded-full shadow-sm"
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
        size="lg"
        isLoading={isUploading}
        glow={!!file && !isUploading}
      >
        {isUploading ? 'Uploading...' : 'Start AI Analysis'}
      </Button>
    </div>
  );
};
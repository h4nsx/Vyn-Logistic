import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { useDatasetStore } from '../../../features/datasets/store';
import { datasetService } from '../../../features/datasets/api/datasets.service';

export const FileUploadZone = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const { setUploadProgress, setCurrentDataset, uploadProgress } = useDatasetStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await datasetService.upload(file, (p) => setUploadProgress(p));
      setCurrentDataset(data.id || 'mock-id-123');
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {!file ? (
        <label className="w-full border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center gap-4 hover:border-orange/50 hover:bg-orange-50/10 transition-all cursor-pointer">
          <input type="file" className="hidden" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="bg-orange-50 p-4 rounded-full text-orange">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-bold text-navy">Click to upload or drag and drop</p>
            <p className="text-sm text-content-secondary">CSV files only (max. 50MB)</p>
          </div>
        </label>
      ) : (
        <div className="w-full p-6 border border-border rounded-2xl flex items-center justify-between bg-surface">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-orange" />
            <div>
              <p className="font-bold text-navy">{file.name}</p>
              <p className="text-xs text-content-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="p-2 hover:bg-danger-50 text-content-muted hover:text-danger rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {isUploading && (
        <div className="w-full bg-border h-2 rounded-full overflow-hidden">
          <div className="bg-orange h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full" isLoading={isUploading}>
        Continue to Mapping
      </Button>
    </div>
  );
};
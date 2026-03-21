import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, ArrowUpRight, FileText, SlidersHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

import { datasetService } from '../../../features/datasets/api/datasets.service';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function DatasetsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: datasetsData, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetService.getAllUploads,
  });

  const datasets = Array.isArray(datasetsData) ? datasetsData : [];

  const deleteMutation = useMutation({
    mutationFn: datasetService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['datasets'] }),
  });

  const filteredDatasets = datasets.filter((ds: any) =>
    (ds.filename || ds.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner className="h-[60vh]" label="Loading datasets..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-navy">Datasets</h1>
          <p className="text-sm text-content-secondary mt-0.5">
            {datasets.length} total · {datasets.filter((d: any) => d.status === 'Analyzed').length} analyzed
          </p>
        </div>
        <Button onClick={() => navigate('/app/upload')} icon={<Plus className="w-4 h-4" />}>
          Upload New
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-navy/10 focus:border-navy/30 outline-none transition-all placeholder:text-content-muted/60"
          />
        </div>
        <button className="p-2.5 bg-white border border-border rounded-xl text-content-muted hover:text-navy hover:border-border-dark transition-all">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Table or Empty */}
      {filteredDatasets.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-surface/50">
            {['Dataset Name', 'Status', 'Records', 'Uploaded', ''].map(h => (
              <span key={h} className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filteredDatasets.map((row: any) => (
            <motion.div
              key={row.id}
              variants={rowVariants}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-navy-50/20 cursor-pointer transition-colors group"
              onClick={() => navigate(`/app/datasets/${row.id}`)}
            >
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-navy-50 rounded-lg text-navy shrink-0 group-hover:bg-navy group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-semibold text-navy truncate">{row.filename || row.name}</span>
              </div>

              {/* Status */}
              <div>
                <Badge
                  variant={row.status === 'Analyzed' ? 'success' : row.status === 'Processing' ? 'warning' : 'danger'}
                  dot={row.status === 'Processing'}
                >
                  {row.status}
                </Badge>
              </div>

              {/* Records */}
              <span className="text-sm text-content-secondary font-medium">
                {(row.rows || 0).toLocaleString()}
              </span>

              {/* Date */}
              <span className="text-sm text-content-muted">
                {dayjs(row.createdAt).format('MMM DD, YYYY')}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/app/datasets/${row.id}`)}
                  className="p-2 hover:bg-navy-50 text-navy rounded-lg transition-colors"
                  title="Open Analysis"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(row.id)}
                  className="p-2 hover:bg-danger-50 text-danger rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title={search ? `No results for "${search}"` : 'No datasets yet'}
          description={search ? 'Try a different search term.' : 'Upload your first CSV to start detecting bottlenecks.'}
          action={!search && (
            <Button onClick={() => navigate('/app/upload')} icon={<Plus className="w-4 h-4" />}>
              Upload Your First CSV
            </Button>
          )}
        />
      )}
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Play, FileText } from 'lucide-react';
import dayjs from 'dayjs';

import { datasetService } from '../../../features/datasets/api/datasets.service';
import { Table } from '../../../shared/components/ui/Table';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/feedback/LoadingSpinner';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';

export function DatasetsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: datasetService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['datasets'] }),
  });

  const filteredDatasets = datasets?.filter((ds: any) => 
    ds.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: 'name', 
      header: 'Dataset Name',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-navy-50 rounded-lg text-navy">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-navy">{row.name}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: any) => (
        <Badge variant={
          row.status === 'Analyzed' ? 'success' : 
          row.status === 'Processing' ? 'warning' : 'danger'
        }>
          {row.status}
        </Badge>
      )
    },
    { 
      key: 'rows', 
      header: 'Records',
      render: (row: any) => row.rows.toLocaleString()
    },
    { 
      key: 'createdAt', 
      header: 'Uploaded',
      render: (row: any) => dayjs(row.createdAt).format('MMM DD, YYYY')
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => navigate(`/app/datasets/${row.id}`)}
            className="p-2 hover:bg-navy-50 text-navy rounded-lg transition-colors"
            title="View Analysis"
          >
            <Play className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteMutation.mutate(row.id)}
            className="p-2 hover:bg-danger-50 text-danger rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Datasets</h1>
          <p className="text-sm text-content-secondary">Manage and review your logistics process data.</p>
        </div>
        <Button onClick={() => navigate('/app/upload')} icon={<Plus className="w-4 h-4" />}>
          Upload New
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
        <input 
          type="text"
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-navy-100 outline-none transition-all"
        />
      </div>

      {/* Content */}
      {filteredDatasets && filteredDatasets.length > 0 ? (
        <Table 
          columns={columns} 
          rows={filteredDatasets} 
          onRowClick={(row) => navigate(`/app/datasets/${row.id}`)}
        />
      ) : (
        <EmptyState 
          title="No datasets found"
          description={search ? `No results matching "${search}"` : "You haven't uploaded any logistics data yet."}
          action={!search && (
            <Button variant="outline" onClick={() => navigate('/app/upload')}>
              Upload your first CSV
            </Button>
          )}
        />
      )}
    </div>
  );
}
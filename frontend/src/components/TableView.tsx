import { useState, useMemo } from 'react';
import { Job } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Input } from './ui/input';

interface TableViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function TableView({ jobs, onJobClick }: TableViewProps) {
  const [filter, setFilter] = useState('');

  const filteredJobs = useMemo(() => {
    if (!filter) return jobs;
    const lower = filter.toLowerCase();
    return jobs.filter(j => 
      j.title.toLowerCase().includes(lower) || 
      j.company.toLowerCase().includes(lower) ||
      j.source.toLowerCase().includes(lower) ||
      (j.applications?.[0]?.status || 'Nouveau').toLowerCase().includes(lower)
    );
  }, [jobs, filter]);

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Filter jobs..." 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-md"
      />
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow 
                key={job.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onJobClick(job)}
              >
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {job.applications?.[0]?.status || 'Nouveau'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.score !== undefined && job.score !== null ? `${job.score}%` : '-'}
                </TableCell>
                <TableCell>{job.contractType || '-'}</TableCell>
                <TableCell>{job.source}</TableCell>
                <TableCell>
                  {job.seenAt ? format(new Date(job.seenAt), 'MMM d, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
            {filteredJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

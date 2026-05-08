import { useState, useMemo } from 'react';
import { Job } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { DndContext, DragEndEvent, closestCorners, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = ['Nouveau', 'Postulé', 'Relance', 'Refus', 'Offre'];

interface KanbanBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: string) => void;
}

function SortableJobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { type: 'Job', job }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab mb-3">
      <Card onClick={onClick} className="hover:border-primary/50 transition-colors shadow-sm bg-card/50">
        <CardContent className="p-4">
          <div className="font-semibold text-sm mb-1 leading-tight">{job.title}</div>
          <div className="text-xs text-muted-foreground mb-2">{job.company}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {job.score !== undefined && job.score !== null && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">{job.score}% Match</Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1 py-0">{job.source}</Badge>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 text-right">
            {job.seenAt ? format(new Date(job.seenAt), 'MMM d') : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Column({ title, jobs, onJobClick }: { title: string; jobs: Job[]; onJobClick: (job: Job) => void }) {
  const { setNodeRef } = useSortable({
    id: title,
    data: { type: 'Column', title }
  });

  return (
    <div className="flex flex-col flex-1 min-w-[250px] bg-secondary/20 rounded-lg p-3">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="bg-secondary/50">{jobs.length}</Badge>
      </div>
      <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[150px]">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <SortableJobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ jobs, onJobClick, onStatusChange }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const columns = useMemo(() => {
    const cols: Record<string, Job[]> = {};
    COLUMNS.forEach(c => cols[c] = []);
    jobs.forEach(job => {
      const status = job.applications?.[0]?.status || 'Nouveau';
      if (cols[status]) cols[status].push(job);
      else cols['Nouveau'].push(job);
    });
    return cols;
  }, [jobs]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Job') {
      setActiveJob(active.data.current.job);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const overId = over.id as string;

    const isOverAColumn = over.data.current?.type === 'Column';
    const isOverAJob = over.data.current?.type === 'Job';

    let newStatus = '';

    if (isOverAColumn) {
      newStatus = over.data.current?.title;
    } else if (isOverAJob) {
      newStatus = over.data.current?.job.applications?.[0]?.status || 'Nouveau';
    }

    const activeJobData = active.data.current?.job;
    const currentStatus = activeJobData?.applications?.[0]?.status || 'Nouveau';

    if (newStatus && newStatus !== currentStatus) {
      onStatusChange(jobId, newStatus);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)] items-start">
        {COLUMNS.map(col => (
          <Column key={col} title={col} jobs={columns[col]} onJobClick={onJobClick} />
        ))}
      </div>
      <DragOverlay>
        {activeJob ? (
          <Card className="shadow-lg bg-card border-primary/50 opacity-80 cursor-grabbing">
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-1 leading-tight">{activeJob.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{activeJob.company}</div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

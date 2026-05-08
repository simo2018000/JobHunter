import { useState, useEffect } from 'react';
import { Job } from '../types';
import { updateJobStatus, updateJobNotes } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function JobDetailModal({ job, isOpen, onClose, onUpdate }: JobDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setNotes(job.applications?.[0]?.notes || '');
    }
  }, [job]);

  if (!job) return null;

  const app = job.applications?.[0];
  const currentStatus = app?.status || 'Nouveau';

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateJobStatus(job.id, newStatus);
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateJobNotes(job.id, notes);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <span>{job.company}</span>
            <span>•</span>
            <span>{job.source}</span>
            {job.contractType && (
              <>
                <span>•</span>
                <Badge variant="outline">{job.contractType}</Badge>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nouveau">Nouveau</SelectItem>
                  <SelectItem value="Postulé">Postulé</SelectItem>
                  <SelectItem value="Relance">Relance</SelectItem>
                  <SelectItem value="Refus">Refus</SelectItem>
                  <SelectItem value="Offre">Offre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {job.score !== null && job.score !== undefined && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Match Score</div>
                <div className="text-3xl font-bold text-primary">{job.score}%</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Details</h3>
            <div className="text-sm text-muted-foreground">
              Seen At: {job.seenAt ? format(new Date(job.seenAt), 'PPP') : 'N/A'}
            </div>
            <a href={job.url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
              View Original Job Posting
            </a>
          </div>

          {job.matchReason && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Match Reason</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{job.matchReason}</p>
            </div>
          )}

          {job.requiredSkills && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.split(',').map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Notes / Draft Email</h3>
            <Textarea 
              className="min-h-[150px] font-mono text-sm" 
              placeholder="Write your notes or draft an email here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handleSaveNotes} disabled={saving} className="mt-2">
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

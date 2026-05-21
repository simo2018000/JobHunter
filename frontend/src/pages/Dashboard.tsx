import { useEffect, useState } from 'react';
import { getJobs, updateJobStatus } from '../services/api';
import { Job } from '../types';
import { StatsDashboard } from '../components/StatsDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { TableView } from '../components/TableView';
import { JobDetailModal } from '../components/JobDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Briefcase } from 'lucide-react';

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      if (selectedJob) {
        const updatedSelected = data.find(j => j.id === selectedJob.id);
        if (updatedSelected) setSelectedJob(updatedSelected);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setJobs(current => current.map(job => {
        if (job.id === jobId) {
          const apps = [...(job.applications || [])];
          if (apps.length === 0) {
            apps.push({ id: 'temp', jobId, status: newStatus as any, notes: '' });
          } else {
            apps[0] = { ...apps[0], status: newStatus as any };
          }
          return { ...job, applications: apps };
        }
        return job;
      }));
      await updateJobStatus(jobId, newStatus);
      fetchJobs();
    } catch (error) {
      console.error("Failed to update status", error);
      fetchJobs();
    }
  };

  return (
    <>
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">JobHunter</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <StatsDashboard />

        <Tabs defaultValue="kanban" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-foreground">Applications</h2>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="kanban">Board</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard
              jobs={jobs}
              onJobClick={setSelectedJob}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <TableView
              jobs={jobs}
              onJobClick={setSelectedJob}
            />
          </TabsContent>
        </Tabs>

        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={fetchJobs}
        />
      </main>
    </>
  );
}

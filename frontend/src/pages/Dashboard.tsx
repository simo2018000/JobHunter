import { useEffect, useState } from 'react';
import { getJobs, updateJobStatus } from '../services/api';
import { Job } from '../types';
import { StatsDashboard } from '../components/StatsDashboard';
import { KanbanBoard } from '../components/KanbanBoard';
import { TableView } from '../components/TableView';
import { JobDetailModal } from '../components/JobDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
    const interval = setInterval(fetchJobs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      // Optimistic update
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
      fetchJobs(); // Revert on failure
    }
  };

  return (
    <div className="container mx-auto py-8">
      <StatsDashboard />
      
      <Tabs defaultValue="kanban" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
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
    </div>
  );
}

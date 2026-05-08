export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  source: string;
  seenAt: string;
  score?: number;
  matchReason?: string;
  requiredSkills?: string;
  contractType?: string;
  applications: Application[];
}

export interface Application {
  id: string;
  jobId: string;
  status: 'Nouveau' | 'Postulé' | 'Relance' | 'Refus' | 'Offre';
  notes: string;
  appliedAt?: string;
  updatedAt?: string;
}

export interface Stats {
  totalScraped: number;
  totalApplied: number;
  responseRate: number;
  averageScore: number;
  jobsBySource: { name: string; value: number }[];
  jobsPerDay: { date: string; count: number }[];
}

import { useEffect, useState } from 'react';
import { getStats, triggerScraper } from '../services/api';
import { Stats } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import { RefreshCw, Play, Briefcase, CheckCircle2, TrendingUp, Star } from 'lucide-react';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await triggerScraper();
      setTimeout(fetchStats, 5000);
    } catch (error) {
      console.error("Failed to trigger scraper", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your applications and stay organized</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchStats} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleTrigger} disabled={loading} className="gap-2">
            <Play className="h-4 w-4" />
            {loading ? 'Running...' : 'Run Scraper'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scraped</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScraped}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applied</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplied}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Jobs by Source</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.jobsBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#3B82F6">
                  {stats.jobsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Jobs Scraped / Day</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.jobsPerDay}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

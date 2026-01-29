import { useState, useEffect } from "react";
import { useJobs, useJob } from "@/hooks/use-jobs";
import { CreateJobForm } from "@/components/CreateJobForm";
import { JobList } from "@/components/JobList";
import { JobDetails } from "@/components/JobDetails";
import { SettingsDialog } from "@/components/SettingsDialog";
import { getBackendUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Server } from "lucide-react";

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Backend Not Configured</CardTitle>
          <CardDescription>
            Connect to your Replit backend to start scraping Google Maps data
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <SettingsDialog onSave={() => window.location.reload()} />
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const { data: jobs, isLoading: jobsLoading, refetch } = useJobs();
  const { data: selectedJob, isLoading: jobLoading } = useJob(selectedJobId);

  // Auto-select latest job when jobs load
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Maps Scraper</h1>
              <p className="text-sm text-muted-foreground">
                Extract business data from Google Maps
              </p>
            </div>
          </div>
          <SettingsDialog onSave={() => refetch()} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <CreateJobForm />

        <div className="grid gap-6 lg:grid-cols-[400px,1fr]">
          <JobList
            jobs={jobs}
            isLoading={jobsLoading}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
          />
          <JobDetails job={selectedJob} isLoading={jobLoading} />
        </div>
      </main>
    </div>
  );
}

const Index = () => {
  const [hasBackendUrl, setHasBackendUrl] = useState(!!getBackendUrl());

  if (!hasBackendUrl) {
    return <SetupRequired />;
  }

  return <Dashboard />;
};

export default Index;

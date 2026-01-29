import { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
}

function getStatusIcon(status: Job["status"]) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

function getStatusVariant(status: Job["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "outline";
    case "failed":
      return "destructive";
  }
}

function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const searchPath = parsed.pathname.replace("/maps/search/", "");
    return decodeURIComponent(searchPath.split("/")[0].replace(/\+/g, " "));
  } catch {
    return url.substring(0, 40) + "...";
  }
}

export function JobList({ jobs, isLoading, selectedJobId, onSelectJob }: JobListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No jobs yet. Start by creating a new scraping job above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Jobs ({jobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                  selectedJobId === job.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(job.status)}
                      <span className="font-medium truncate">
                        {formatUrl(job.url)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={getStatusVariant(job.status)} className="text-xs">
                        {job.status}
                      </Badge>
                      {job.resultCount > 0 && (
                        <span>{job.resultCount} results</span>
                      )}
                      {job.progress && job.status === "processing" && (
                        <span className="truncate">{job.progress}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {job.error && (
                  <p className="mt-2 text-sm text-destructive truncate">
                    {job.error}
                  </p>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

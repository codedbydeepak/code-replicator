import { JobWithResults, Result } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, CheckCircle2, XCircle, Loader2, Filter, FilterX } from "lucide-react";
import { toast } from "sonner";

interface JobDetailsProps {
  job: JobWithResults | null | undefined;
  isLoading: boolean;
}

function exportToCsv(results: Result[], filename: string) {
  const headers = ["Name", "Website", "Filtered"];
  const rows = results.map((r) => [
    `"${r.name.replace(/"/g, '""')}"`,
    r.website || "",
    r.filtered === 1 ? "Yes" : "No",
  ]);
  
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${results.length} results to ${filename}`);
}

function ResultsTable({ results, showFiltered }: { results: Result[]; showFiltered: boolean }) {
  const filtered = showFiltered
    ? results
    : results.filter((r) => r.filtered === 0);

  if (filtered.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {showFiltered ? "No results found" : "No unfiltered results. Try viewing all results."}
      </p>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Business Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((result) => (
            <TableRow key={result.id} className={result.filtered === 1 ? "opacity-50" : ""}>
              <TableCell className="font-medium">{result.name}</TableCell>
              <TableCell>
                {result.website ? (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline max-w-[200px] truncate"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{new URL(result.website).hostname}</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {result.filtered === 1 ? (
                  <Badge variant="secondary" className="text-xs">
                    <FilterX className="h-3 w-3 mr-1" />
                    Filtered
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

export function JobDetails({ job, isLoading }: JobDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="py-16">
          <p className="text-center text-muted-foreground">
            Select a job to view details and results
          </p>
        </CardContent>
      </Card>
    );
  }

  const includedResults = job.results.filter((r) => r.filtered === 0);
  const filteredResults = job.results.filter((r) => r.filtered === 1);
  const websiteResults = job.results.filter((r) => r.website && r.filtered === 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Job #{job.id}
              {job.status === "processing" && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {job.status === "completed" && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
              {job.status === "failed" && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </CardTitle>
            <CardDescription className="mt-1 max-w-md truncate">
              {job.url}
            </CardDescription>
          </div>
          {job.results.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCsv(includedResults, `job-${job.id}-results.csv`)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export ({includedResults.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCsv(websiteResults, `job-${job.id}-with-websites.csv`)}
                disabled={websiteResults.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                With Websites ({websiteResults.length})
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{job.results.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{includedResults.length}</p>
            <p className="text-xs text-muted-foreground">Included</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{filteredResults.length}</p>
            <p className="text-xs text-muted-foreground">Filtered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{websiteResults.length}</p>
            <p className="text-xs text-muted-foreground">With Website</p>
          </div>
        </div>

        {job.progress && job.status === "processing" && (
          <p className="text-sm text-primary mt-2">{job.progress}</p>
        )}
        {job.error && (
          <p className="text-sm text-destructive mt-2">{job.error}</p>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="included">
          <TabsList>
            <TabsTrigger value="included" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Included ({includedResults.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1">
              <Filter className="h-3 w-3" />
              All ({job.results.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="included" className="mt-4">
            <ResultsTable results={job.results} showFiltered={false} />
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            <ResultsTable results={job.results} showFiltered={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

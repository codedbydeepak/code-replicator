import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateJob } from "@/hooks/use-jobs";
import { toast } from "sonner";
import { Loader2, Search, MapPin } from "lucide-react";

export function CreateJobForm() {
  const [url, setUrl] = useState("");
  const createJob = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a Google Maps URL");
      return;
    }

    try {
      await createJob.mutateAsync({ url: url.trim() });
      toast.success("Scraping job started!");
      setUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create job");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          New Scraping Job
        </CardTitle>
        <CardDescription>
          Enter a Google Maps search URL to extract business data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.google.com/maps/search/restaurants+in+new+york"
            className="flex-1"
            disabled={createJob.isPending}
          />
          <Button type="submit" disabled={createJob.isPending}>
            {createJob.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Scraping
              </>
            )}
          </Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          💡 Tip: Search for businesses on Google Maps, then copy the URL from your browser
        </p>
      </CardContent>
    </Card>
  );
}

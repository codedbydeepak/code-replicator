import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getBackendUrl, setBackendUrl } from "@/lib/api";
import { toast } from "sonner";
import { Settings, Server, Check, AlertCircle } from "lucide-react";

interface SettingsDialogProps {
  onSave?: () => void;
}

export function SettingsDialog({ onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    setUrl(getBackendUrl());
  }, [open]);

  const testConnection = async () => {
    if (!url.trim()) {
      toast.error("Please enter a backend URL");
      return;
    }

    setTesting(true);
    setConnected(null);

    try {
      const cleanUrl = url.trim().replace(/\/$/, "");
      const response = await fetch(`${cleanUrl}/api/jobs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setConnected(true);
        toast.success("Connection successful!");
      } else {
        setConnected(false);
        toast.error(`Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setConnected(false);
      toast.error("Connection failed. Make sure your Replit backend is running.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setBackendUrl(url.trim());
    toast.success("Backend URL saved");
    setOpen(false);
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Backend Configuration
          </DialogTitle>
          <DialogDescription>
            Connect to your Replit backend running the Maps Scraper server
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url">Replit Backend URL</Label>
            <Input
              id="backend-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setConnected(null);
              }}
              placeholder="https://your-replit-name.repl.co"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of your Replit deployment. You can find this in your Replit project's "Webview" tab.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={testConnection}
              disabled={testing || !url.trim()}
            >
              {testing ? "Testing..." : "Test Connection"}
            </Button>

            {connected === true && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
            )}
            {connected === false && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!url.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

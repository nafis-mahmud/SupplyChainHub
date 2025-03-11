import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateSeleniumScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateScript: (data: {
    name: string;
    description: string;
    script_content: string;
  }) => void;
  projectId: string;
}

export function CreateSeleniumScriptDialog({
  open,
  onOpenChange,
  onCreateScript,
  projectId,
}: CreateSeleniumScriptDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Script name is required");
      return;
    }

    if (!scriptContent.trim()) {
      setError("Script content is required");
      return;
    }

    setIsSubmitting(true);
    onCreateScript({ name, description, script_content: scriptContent });
    setIsSubmitting(false);
    setName("");
    setDescription("");
    setScriptContent("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Selenium Script</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Script Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter script name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter script description"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scriptContent">Script Content</Label>
            <Textarea
              id="scriptContent"
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder="Enter Selenium script content"
              rows={10}
              className="font-mono text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !scriptContent || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Script"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

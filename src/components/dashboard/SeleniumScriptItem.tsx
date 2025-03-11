import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Code,
  Save,
  Trash2,
  Play,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SeleniumScript,
  updateSeleniumScript,
} from "@/lib/seleniumScriptService";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface SeleniumScriptItemProps {
  script: SeleniumScript;
  onDelete?: (id: string) => void;
  className?: string;
}

export function SeleniumScriptItem({
  script,
  onDelete,
  className,
}: SeleniumScriptItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(script.name);
  const [description, setDescription] = useState(script.description || "");
  const [scriptContent, setScriptContent] = useState(script.script_content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSeleniumScript(script.id, {
        name,
        description,
        script_content: scriptContent,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating selenium script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent);
  };

  return (
    <div className={cn("rounded-md border p-2", className)}>
      <div
        className="flex items-center justify-between gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
            <Code className="h-3 w-3 text-blue-600" />
          </div>
          <div className="flex items-center gap-1">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            <p className="text-xs font-medium">{script.name}</p>
          </div>
        </div>
        <div className="flex items-center">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(script.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {!expanded && script.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {script.description}
        </p>
      )}

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Script name"
              className="text-xs"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this script..."
              className="min-h-[60px] text-xs"
            />
            <div className="relative">
              <Textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                placeholder="Selenium script content..."
                className="min-h-[200px] text-xs font-mono"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2 flex items-center gap-1"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs px-2 flex items-center gap-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-3 w-3" />
                  {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

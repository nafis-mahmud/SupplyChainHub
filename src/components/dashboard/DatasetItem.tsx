import { Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/lib/datasetService";
import { cn } from "@/lib/utils";

interface DatasetItemProps {
  dataset: Dataset;
  onDelete?: (id: string) => void;
  className?: string;
}

export function DatasetItem({
  dataset,
  onDelete,
  className,
}: DatasetItemProps) {
  return (
    <div className={cn("rounded-md border p-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
            <Database className="h-3 w-3 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium">{dataset.name}</p>
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-red-500"
            onClick={() => onDelete(dataset.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      {dataset.description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {dataset.description}
        </p>
      )}
    </div>
  );
}

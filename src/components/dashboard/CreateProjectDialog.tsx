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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
<<<<<<< HEAD
  onCreateProject: (data: { title: string; category: string }) => void;
  categories: Array<{ id: string; name: string; count: number }>;
=======
  onCreateProject: (projectData: { title: string; category: string }) => void;
  categories: Array<{ id: string; name: string }>;
>>>>>>> f082c8f9597cf0c247dd6782e0bab689ca4ca895
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
  categories,
}: CreateProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
<<<<<<< HEAD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    setIsSubmitting(true);
    onCreateProject({ title, category });
    setIsSubmitting(false);
    setTitle("");
    setCategory("");
=======
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Project name is required");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    onCreateProject({ title, category });
    setTitle("");
    setCategory("");
    setError(null);
>>>>>>> f082c8f9597cf0c247dd6782e0bab689ca4ca895
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.id !== "all")
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
=======
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.id !== "all")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
>>>>>>> f082c8f9597cf0c247dd6782e0bab689ca4ca895
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
<<<<<<< HEAD
            <Button
              type="submit"
              disabled={!title || !category || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
=======
            <Button type="submit">Create</Button>
>>>>>>> f082c8f9597cf0c247dd6782e0bab689ca4ca895
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

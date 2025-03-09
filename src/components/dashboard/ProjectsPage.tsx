import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { CategoryFolder } from "./CategoryFolder";
import { ProjectList } from "./ProjectList";
import { ViewMode } from "./ViewToggle";
import { ProjectCardProps } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { categories, mockProjects } from "./mockData";

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectCardProps[]>(mockProjects);

  // Filter projects based on search query and selected category
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      project.category.toLowerCase() ===
        categories.find((c) => c.id === selectedCategory)?.name.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCreateProject = () => {
    setIsCreateDialogOpen(true);
  };

  const handleProjectCreation = (projectData: {
    title: string;
    category: string;
  }) => {
    // Create a new project with the provided data
    const newProject: ProjectCardProps = {
<<<<<<< HEAD
      id: `project-${Date.now()}`, // Generate a unique ID
=======
      id: `${projects.length + 1}`,
>>>>>>> f082c8f9597cf0c247dd6782e0bab689ca4ca895
      title: projectData.title,
      description: `This is a new ${projectData.category.toLowerCase()} project.`,
      category: projectData.category,
      resources: 0,
      flows: 0,
      datasets: 0,
      dashboards: 0,
      teamMembers: [
        {
          id: "1",
          name: "John Doe",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        },
      ],
      lastUpdated: "Just now",
    };

    // Add the new project to the projects array
    setProjects([newProject, ...projects]);

    // Update the category count
    const categoryId = categories.find(
      (c) => c.name === projectData.category,
    )?.id;
    if (categoryId && categoryId !== "all") {
      const categoryIndex = categories.findIndex((c) => c.id === categoryId);
      if (categoryIndex !== -1) {
        categories[categoryIndex].count += 1;
        categories[0].count += 1; // Update 'All Projects' count
      }
    }

    // Select the category of the new project
    const newCategoryId = categories.find(
      (c) => c.name === projectData.category,
    )?.id;
    if (newCategoryId) {
      setSelectedCategory(newCategoryId);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          <h1 className="mb-6 text-3xl font-bold">Projects</h1>

          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateProject={handleCreateProject}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-3">
              <h2 className="font-semibold">Categories</h2>
              {categories.map((category) => (
                <CategoryFolder
                  key={category.id}
                  name={category.name}
                  count={category.count}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>

            <div className="lg:col-span-3">
              <h2 className="mb-4 font-semibold">
                {selectedCategory === "all"
                  ? "All Projects"
                  : categories.find((c) => c.id === selectedCategory)?.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({filteredProjects.length})
                </span>
              </h2>

              {filteredProjects.length > 0 ? (
                <ProjectList projects={filteredProjects} viewMode={viewMode} />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleProjectCreation}
        categories={categories}
      />
    </div>
  );
}

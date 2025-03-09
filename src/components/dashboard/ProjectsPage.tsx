import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { CategoryFolder } from "./CategoryFolder";
import { ProjectList } from "./ProjectList";
import { ViewMode } from "./ViewToggle";
import { ProjectCardProps } from "./ProjectCard";

// Mock data for demonstration
const categories = [
  { id: "all", name: "All Projects", count: 12 },
  { id: "supply-chain", name: "Supply Chain", count: 5 },
  { id: "inventory", name: "Inventory", count: 3 },
  { id: "logistics", name: "Logistics", count: 2 },
  { id: "procurement", name: "Procurement", count: 2 },
];

export const mockProjects: ProjectCardProps[] = [
  {
    id: "1",
    title: "Global Supply Chain Optimization",
    description:
      "Optimize the global supply chain network to reduce costs and improve delivery times.",
    category: "Supply Chain",
    resources: 12,
    flows: 8,
    datasets: 5,
    dashboards: 3,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "4",
        name: "Alice Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
    ],
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "Warehouse Inventory Management",
    description:
      "Track and manage inventory levels across multiple warehouse locations.",
    category: "Inventory",
    resources: 8,
    flows: 5,
    datasets: 3,
    dashboards: 2,
    teamMembers: [
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Logistics Route Optimization",
    description:
      "Optimize delivery routes to minimize fuel consumption and delivery times.",
    category: "Logistics",
    resources: 6,
    flows: 4,
    datasets: 2,
    dashboards: 1,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "6",
        name: "Sarah Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
    ],
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    title: "Procurement Analytics",
    description:
      "Analyze procurement data to identify cost-saving opportunities and optimize vendor selection.",
    category: "Procurement",
    resources: 10,
    flows: 6,
    datasets: 4,
    dashboards: 2,
    teamMembers: [
      {
        id: "4",
        name: "Alice Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "5 days ago",
  },
  {
    id: "5",
    title: "Inventory Forecasting",
    description:
      "Forecast inventory needs based on historical data and seasonal trends.",
    category: "Inventory",
    resources: 7,
    flows: 3,
    datasets: 5,
    dashboards: 2,
    teamMembers: [
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "6",
        name: "Sarah Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
    ],
    lastUpdated: "2 weeks ago",
  },
  {
    id: "6",
    title: "Supplier Performance Dashboard",
    description:
      "Monitor and evaluate supplier performance metrics in real-time.",
    category: "Supply Chain",
    resources: 9,
    flows: 4,
    datasets: 6,
    dashboards: 3,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "1 day ago",
  },
];

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter projects based on search query and selected category
  const filteredProjects = mockProjects.filter((project) => {
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
    // This would open a modal or navigate to a create project page
    console.log("Create new project");
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
    </div>
  );
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Play,
  RotateCcw,
  MoreHorizontal,
  Clock,
  Database,
  BarChart3,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { ProjectCardProps } from "./ProjectCard";
import { mockProjects } from "./mockData";
import { useLocation } from "react-router-dom";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const projectFromState = location.state?.project as
    | ProjectCardProps
    | undefined;

  const [project, setProject] = useState<ProjectCardProps | undefined>(
    projectFromState || mockProjects.find((p) => p.id === projectId),
  );

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2 text-muted-foreground">
            The project you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button size="sm">
                <Play className="mr-2 h-4 w-4" /> Run
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Last updated */}
          <div className="mb-6 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Last updated {project.lastUpdated}</span>
            <span className="mx-2">•</span>
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-6 w-6 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Left sidebar */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 font-medium">Inputs</h3>
                <div className="relative">
                  <Input placeholder="Search..." className="pl-8" />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Datasets</h4>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                          <Database className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">
                            Amazon_table_chart
                          </p>
                          <p className="text-xs text-muted-foreground">CSV</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                          <Database className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">
                            SKU_Map_table_chart
                          </p>
                          <p className="text-xs text-muted-foreground">CSV</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                          <Database className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">
                            Inventory_Across_Channels_table_chart
                          </p>
                          <p className="text-xs text-muted-foreground">XLS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Connectors</h4>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100">
                          <svg
                            className="h-3 w-3 text-amber-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M13.833 2.5H15.5c.69 0 1.25.56 1.25 1.25V4h2.75c.69 0 1.25.56 1.25 1.25v15.5c0 .69-.56 1.25-1.25 1.25H4.5c-.69 0-1.25-.56-1.25-1.25V5.25C3.25 4.56 3.81 4 4.5 4h2.75V3.75c0-.69.56-1.25 1.25-1.25h1.667c.69 0 1.25.56 1.25 1.25v.5h1.666v-.5c0-.69.56-1.25 1.25-1.25z" />
                          </svg>
                        </div>
                        <p className="text-xs font-medium">
                          AWS Asset Inventory
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                          <svg
                            className="h-3 w-3 text-red-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          </svg>
                        </div>
                        <p className="text-xs font-medium">Adobe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="dashboards">
                <TabsList className="mb-4">
                  <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboards" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Dashboards</h3>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Dashboard
                    </Button>
                  </div>

                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-medium">
                      No dashboards added yet
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first dashboard to visualize your data.
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Create Dashboard
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="charts" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Charts</h3>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Chart
                    </Button>
                  </div>

                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-medium">No charts added yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first chart to visualize your data.
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Create Chart
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Actions</h3>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Action
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Use Template</h4>
                          <p className="text-xs text-muted-foreground">
                            Some text can go here explaining what a template
                            does
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Convert Excel</h4>
                          <p className="text-xs text-muted-foreground">
                            Text explaining how a user can convert an excel
                            sheet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

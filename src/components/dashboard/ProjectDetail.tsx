import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
  Loader2,
  Code,
} from "lucide-react";
import { ProjectCardProps } from "./ProjectCard";
import { getProjectById } from "@/lib/projectService";
import {
  Dataset,
  getProjectDatasets,
  createDataset,
  deleteDataset,
} from "@/lib/datasetService";
import {
  SeleniumScript,
  getProjectSeleniumScripts,
  createSeleniumScript,
  deleteSeleniumScript,
} from "@/lib/seleniumScriptService";
import { CreateDatasetDialog } from "./CreateDatasetDialog";
import { CreateSeleniumScriptDialog } from "./CreateSeleniumScriptDialog";
import { DatasetItem } from "./DatasetItem";
import { SeleniumScriptItem } from "./SeleniumScriptItem";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const projectFromState = location.state?.project as
    | ProjectCardProps
    | undefined;

  const [project, setProject] = useState<ProjectCardProps | undefined>(
    projectFromState,
  );
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [seleniumScripts, setSeleniumScripts] = useState<SeleniumScript[]>([]);
  const [loading, setLoading] = useState(!projectFromState);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [scriptsLoading, setScriptsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDatasetDialogOpen, setIsCreateDatasetDialogOpen] =
    useState(false);
  const [isCreateScriptDialogOpen, setIsCreateScriptDialogOpen] =
    useState(false);

  useEffect(() => {
    // If we don't have the project from state, fetch it from Supabase
    if (!projectFromState && projectId) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const projectData = await getProjectById(projectId);
          if (projectData) {
            setProject(projectData);
          } else {
            setError("Project not found");
          }
        } catch (err) {
          console.error("Error fetching project:", err);
          setError("Failed to load project details");
        } finally {
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [projectId, projectFromState]);

  // Fetch datasets for the project
  useEffect(() => {
    if (projectId) {
      const fetchDatasets = async () => {
        try {
          setDatasetsLoading(true);
          const datasetsData = await getProjectDatasets(projectId);
          setDatasets(datasetsData);
        } catch (err) {
          console.error("Error fetching datasets:", err);
        } finally {
          setDatasetsLoading(false);
        }
      };

      fetchDatasets();
    }
  }, [projectId]);

  // Fetch selenium scripts for the project
  useEffect(() => {
    if (projectId) {
      const fetchSeleniumScripts = async () => {
        try {
          setScriptsLoading(true);
          const scriptsData = await getProjectSeleniumScripts(projectId);
          setSeleniumScripts(scriptsData);
        } catch (err) {
          console.error("Error fetching selenium scripts:", err);
        } finally {
          setScriptsLoading(false);
        }
      };

      fetchSeleniumScripts();
    }
  }, [projectId]);

  const handleCreateDataset = async (data: {
    name: string;
    description: string;
  }) => {
    if (!projectId) return;

    try {
      const newDataset = await createDataset({
        ...data,
        project_id: projectId,
      });

      if (newDataset) {
        setDatasets([newDataset, ...datasets]);

        // Update project datasets count
        if (project) {
          setProject({
            ...project,
            datasets: (project.datasets || 0) + 1,
          });
        }
      }
    } catch (err) {
      console.error("Error creating dataset:", err);
    }
  };

  const handleCreateSeleniumScript = async (data: {
    name: string;
    description: string;
    script_content: string;
  }) => {
    if (!projectId) return;

    try {
      const newScript = await createSeleniumScript({
        ...data,
        project_id: projectId,
      });

      if (newScript) {
        setSeleniumScripts([newScript, ...seleniumScripts]);
      }
    } catch (err) {
      console.error("Error creating selenium script:", err);
    }
  };

  // Refresh datasets after update
  const refreshDatasets = async () => {
    if (!projectId) return;

    try {
      setDatasetsLoading(true);
      const datasetsData = await getProjectDatasets(projectId);
      setDatasets(datasetsData);
    } catch (err) {
      console.error("Error refreshing datasets:", err);
    } finally {
      setDatasetsLoading(false);
    }
  };

  // Refresh selenium scripts after update
  const refreshSeleniumScripts = async () => {
    if (!projectId) return;

    try {
      setScriptsLoading(true);
      const scriptsData = await getProjectSeleniumScripts(projectId);
      setSeleniumScripts(scriptsData);
    } catch (err) {
      console.error("Error refreshing selenium scripts:", err);
    } finally {
      setScriptsLoading(false);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    try {
      const success = await deleteDataset(datasetId);
      if (success) {
        setDatasets(datasets.filter((d) => d.id !== datasetId));

        // Update project datasets count
        if (project && project.datasets > 0) {
          setProject({
            ...project,
            datasets: project.datasets - 1,
          });
        }
      }
    } catch (err) {
      console.error("Error deleting dataset:", err);
    }
  };

  const handleDeleteSeleniumScript = async (scriptId: string) => {
    try {
      const success = await deleteSeleniumScript(scriptId);
      if (success) {
        setSeleniumScripts(seleniumScripts.filter((s) => s.id !== scriptId));
      }
    } catch (err) {
      console.error("Error deleting selenium script:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2 text-muted-foreground">
            {error || "The project you're looking for doesn't exist."}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setIsCreateDatasetDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {datasets.length > 0 ? (
                      datasets.map((dataset) => (
                        <DatasetItem
                          key={dataset.id}
                          dataset={dataset}
                          onDelete={handleDeleteDataset}
                        />
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed p-4 text-center">
                        <p className="text-xs text-muted-foreground">
                          No datasets added yet
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => setIsCreateDatasetDialogOpen(true)}
                        >
                          Add your first dataset
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Selenium Scripts</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setIsCreateScriptDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {seleniumScripts.length > 0 ? (
                      seleniumScripts.map((script) => (
                        <SeleniumScriptItem
                          key={script.id}
                          script={script}
                          onDelete={handleDeleteSeleniumScript}
                        />
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed p-4 text-center">
                        <p className="text-xs text-muted-foreground">
                          No Selenium scripts added yet
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => setIsCreateScriptDialogOpen(true)}
                        >
                          Add your first Selenium script
                        </Button>
                      </div>
                    )}
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
                  <TabsTrigger value="selenium">Selenium Scripts</TabsTrigger>
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

                <TabsContent value="selenium" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Selenium Scripts</h3>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateScriptDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Selenium Script
                    </Button>
                  </div>

                  {scriptsLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : seleniumScripts.length > 0 ? (
                    <div className="space-y-4">
                      {seleniumScripts.map((script) => (
                        <div key={script.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                                <Code className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{script.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {script.description || "No description"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    script.script_content,
                                  );
                                }}
                              >
                                Copy Script
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSeleniumScript(script.id)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <pre className="rounded-md bg-slate-100 p-4 text-xs font-mono overflow-auto max-h-[300px]">
                              {script.script_content}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 font-medium">
                        No Selenium scripts added yet
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add Selenium scripts to automate browser interactions.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsCreateScriptDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Selenium Script
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <CreateDatasetDialog
        open={isCreateDatasetDialogOpen}
        onOpenChange={setIsCreateDatasetDialogOpen}
        onCreateDataset={handleCreateDataset}
        projectId={projectId || ""}
      />

      <CreateSeleniumScriptDialog
        open={isCreateScriptDialogOpen}
        onOpenChange={setIsCreateScriptDialogOpen}
        onCreateScript={handleCreateSeleniumScript}
        projectId={projectId || ""}
      />
    </div>
  );
}

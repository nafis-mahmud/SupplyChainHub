import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Database, FileText, GitBranch, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  resources: number;
  flows: number;
  datasets: number;
  dashboards: number;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastUpdated: string;
  className?: string;
}

export function ProjectCard(props: ProjectCardProps) {
  const {
    id,
    title,
    description,
    category,
    resources,
    flows,
    datasets,
    dashboards,
    teamMembers,
    lastUpdated,
    className,
  } = props;
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/project/${id}`, { state: { project: props } });
  };
  return (
    <Link to={`/project/${id}`} className="block" onClick={handleClick}>
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-md cursor-pointer",
          className,
        )}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{title}</h3>
              <Badge variant="outline" className="mt-1">
                {category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>{resources} Resources</span>
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              <span>{flows} Flows</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{datasets} Datasets</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{dashboards} Dashboards</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4 pt-2">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((member) => (
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
            {teamMembers.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                +{teamMembers.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Updated {lastUpdated}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

import { ProjectCardProps } from "./ProjectCard";

// Mock data for demonstration
export let categories = [
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

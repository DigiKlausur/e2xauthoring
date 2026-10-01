import { Outlet } from "react-router-dom";
import { ClipboardList, FileText, Layers } from "lucide-react";
import { TabBar } from "@components/ui/TabBar";
import { appName } from "@domain/texts";
import { routes } from "@/lib/routes";

const tabs = [
  {
    to: routes.pools,
    label: "Task Pools",
    icon: <Layers className="size-4" />,
  },
  {
    to: routes.templates,
    label: "Templates",
    icon: <FileText className="size-4" />,
  },
  {
    to: routes.assignments,
    label: "Assignments",
    icon: <ClipboardList className="size-4" />,
  },
];

export function AppLayout() {
  return (
    <>
      <div className="bg-white border-b border-gray-200 px-10 flex items-center gap-10">
        <span className="text-lg font-bold text-primary py-3">{appName}</span>
        <TabBar tabs={tabs} />
      </div>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </>
  );
}

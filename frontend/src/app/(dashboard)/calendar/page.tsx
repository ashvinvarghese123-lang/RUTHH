import { Topbar } from "@/components/layout/Topbar";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div>
      <Topbar title="Calendar" />
      <div className="px-4 pb-16 sm:px-6 md:px-10">
        <CalendarView />
      </div>
    </div>
  );
}

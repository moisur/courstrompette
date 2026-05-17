"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";
import { DAYS_OF_WEEK, getStartOfWeek } from "@/lib/schedule";
import { Student } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const PIXELS_PER_HOUR = 64;
const AGENDA_START_HOUR = 9;
const AGENDA_END_HOUR = 20;
const LESSON_DURATION_MINUTES = 45;

interface AgendaEvent extends Student {
  start: number;
  end: number;
  columns: number;
  left: number;
}

function buildTimeLabels() {
  const labels: string[] = [];
  for (let hour = AGENDA_START_HOUR; hour <= AGENDA_END_HOUR; hour += 1) {
    labels.push(`${hour}:00`);
  }
  return labels;
}

function getEventPosition(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = (hour - AGENDA_START_HOUR) * 60 + minute;
  return (totalMinutes / 60) * PIXELS_PER_HOUR;
}

function processEventsForDay(dayStudents: Student[]): AgendaEvent[] {
  if (dayStudents.length === 0) {
    return [];
  }

  const events = dayStudents
    .map((student) => {
      const [hour, minute] = student.courseHour!.split(":").map(Number);
      const start = hour * 60 + minute;
      return {
        ...student,
        start,
        end: start + LESSON_DURATION_MINUTES,
        columns: 1,
        left: 0,
      };
    })
    .sort((left, right) => left.start - right.start);

  const collisionGroups: AgendaEvent[][] = [];
  let currentGroup: AgendaEvent[] = [];

  for (const event of events) {
    if (currentGroup.length === 0 || event.start < currentGroup[currentGroup.length - 1].end) {
      currentGroup.push(event);
    } else {
      collisionGroups.push(currentGroup);
      currentGroup = [event];
    }
  }

  collisionGroups.push(currentGroup);

  for (const group of collisionGroups) {
    for (let index = 0; index < group.length; index += 1) {
      let maxColumns = 1;
      for (let otherIndex = index + 1; otherIndex < group.length; otherIndex += 1) {
        if (group[otherIndex].start < group[index].end) {
          maxColumns += 1;
        }
      }

      group[index].columns = Math.max(group[index].columns, maxColumns);

      let occupiedSlots = 0;
      for (let otherIndex = 0; otherIndex < index; otherIndex += 1) {
        if (group[otherIndex].start < group[index].end && group[index].start < group[otherIndex].end) {
          occupiedSlots += 1;
        }
      }

      group[index].left = occupiedSlots;
    }
  }

  return events;
}

const timeLabels = buildTimeLabels();

export default function AgendaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await apiRequest<Student[]>("/api/students");
        setStudents(data.filter((student) => student.courseDay && student.courseHour && !student.archived));
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

  const weekDates = useMemo(() => {
    const startOfWeek = getStartOfWeek(currentDate);
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    });
  }, [currentDate]);

  return (
    <div className="container py-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((date) => new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">Semaine du {weekDates[0]}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((date) => new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto border rounded-md bg-white">
        <div className="grid grid-cols-[auto_1fr]">
          <div className="sticky top-0 z-20 bg-background border-b border-r" />

          <div className="grid grid-cols-5 sticky top-0 z-20 bg-background">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="text-center font-semibold py-2 border-b border-r">
                {day}
                <br />
                <span className="text-sm text-muted-foreground">{weekDates[index]}</span>
              </div>
            ))}
          </div>

          <div className="row-span-2 border-r bg-background sticky left-0 z-10">
            {timeLabels.map((time) => (
              <div key={time} className="text-right pr-2 text-xs text-muted-foreground relative" style={{ height: `${PIXELS_PER_HOUR}px` }}>
                <span className="absolute -top-2 right-2">{time}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 relative">
            {timeLabels.slice(1).map((time) => (
              <div key={`line-${time}`} className="col-span-5 border-t" style={{ height: `${PIXELS_PER_HOUR}px` }} />
            ))}
            {DAYS_OF_WEEK.slice(0, -1).map((day, index) => (
              <div key={`vline-${day}`} className="row-start-1 row-span-full h-full border-r" style={{ gridColumnStart: index + 1 }} />
            ))}

            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const processedEvents = processEventsForDay(students.filter((student) => student.courseDay === day));
              return (
                <div key={day} className="col-start-auto relative" style={{ gridColumnStart: dayIndex + 1 }}>
                  {processedEvents.map((event) => {
                    const width = 100 / event.columns;
                    const left = event.left * width;
                    return (
                      <div
                        key={event._id}
                        onClick={() => router.push(`/students/${event._id}`)}
                        className="absolute bg-blue-200 text-blue-900 border-l-4 border-blue-500 rounded-r-md p-1 text-xs cursor-pointer overflow-hidden shadow-sm"
                        style={{
                          top: `${getEventPosition(event.courseHour!)}px`,
                          height: `${(LESSON_DURATION_MINUTES / 60) * PIXELS_PER_HOUR}px`,
                          width: `calc(${width}% - 4px)`,
                          left: `${left}%`,
                          marginLeft: "2px",
                        }}
                      >
                        <p className="font-bold truncate">{event.name}</p>
                        <p className="truncate">{event.courseHour}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] as const;

export const STUDENT_TIME_SLOT_START = { hour: 10, minute: 30 };
export const STUDENT_TIME_SLOT_END = { hour: 19, minute: 0 };
export const STUDENT_TIME_SLOT_INTERVAL_MINUTES = 15;

export function buildStudentTimeSlots() {
  const slots: string[] = [];
  const startTime = new Date();
  startTime.setHours(STUDENT_TIME_SLOT_START.hour, STUDENT_TIME_SLOT_START.minute, 0, 0);

  const endTime = new Date();
  endTime.setHours(STUDENT_TIME_SLOT_END.hour, STUDENT_TIME_SLOT_END.minute, 0, 0);

  while (startTime <= endTime) {
    const hours = startTime.getHours().toString().padStart(2, "0");
    const minutes = startTime.getMinutes().toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    startTime.setMinutes(startTime.getMinutes() + STUDENT_TIME_SLOT_INTERVAL_MINUTES);
  }

  return slots;
}

export function getStartOfWeek(date: Date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = nextDate.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(nextDate.setDate(diff));
}

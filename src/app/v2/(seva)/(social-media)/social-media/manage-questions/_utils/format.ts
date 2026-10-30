import { format, isValid, parseISO } from "date-fns";

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? format(date, "dd MMM, yyyy") : null;
}

export function formatSchedule(
  date: string | null,
  time: string | null,
): string | null {
  const formattedDate = formatDate(date);
  if (!formattedDate) return null;
  return time ? `${formattedDate} ${time}` : formattedDate;
}

export function toDateValue(value: string | null): Date | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function toDateString(value: Date | null): string | null {
  return value ? format(value, "yyyy-MM-dd") : null;
}

export function buildTimeSlots(
  stepMinutes = 30,
): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    slots.push({ label: `${hour}:${minute}`, value: `${hour}:${minute}` });
  }
  return slots;
}

export function todayKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function weekdayKey(date = new Date()):
  | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][date.getDay()] as any;
}

export function monthDays(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const days: Date[] = [];
  let d = new Date(first);
  while (d.getMonth() === monthIndex) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

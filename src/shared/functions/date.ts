const MILLI_SECS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDateDiff(date1: Date, date2: Date) {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.round(timeDiff / MILLI_SECS_PER_DAY);
}

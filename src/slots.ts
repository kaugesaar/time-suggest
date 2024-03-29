import { IntervalTree } from "./interval-tree";

export interface GetCalendarParams {
  // The calendar ID to get events from.
  calendarId?: string;
  // The start of the period to get events from.
  from: Date;
  // The end of the period to get events from.
  to: Date;
}

export interface GetSlotsParams {
  // The duration of the meeting in minutes.
  duration?: number;
  // The number of slots to return.
  numSlots?: number;
  // Whether to include weekends.
  includeWeekends?: boolean;
  // The start/end of the day in hours, minutes, and seconds.
  daily?: {
    // The start of the day in hours, minutes, and seconds.
    from?: [number, number?, number?];
    // The end of the day in hours, minutes, and seconds.
    to?: [number, number?, number?];
  };
}

export interface Slot {
  // The start of the slot.
  start: Date;
  // The end of the slot.
  end: Date;
}

/**
 * getSlots returns a list of available time slots.
 */
export function getSlots(params: GetCalendarParams & GetSlotsParams): Slot[] {
  const slotDurationMs = (params.duration ?? 30) * 60 * 1000;
  const daysAllowed = params.includeWeekends
    ? [0, 1, 2, 3, 4, 5, 6]
    : [1, 2, 3, 4, 5];

  const allPossibleSlots: Slot[] = [];

  const calendarEvents = getEventsFromCalendar(params);

  const intervalTree = new IntervalTree();
  calendarEvents.forEach(event => {
    intervalTree.insert(event.timeStart, event.timeEnd);
  });

  const currentDate = new Date(params.from);
  const endDate = new Date(params.to);

  while (currentDate <= endDate) {
    if (daysAllowed.includes(currentDate.getDay())) {
      const { start, end } = getStartAndEndOfDay(currentDate, params);
      const events = intervalTree
        .search(start.getTime(), end.getTime())
        .sort((a, b) => a.start - b.start);

      if (events.length === 0) {
        allPossibleSlots.push({ start, end });
      } else {
        if (events[0].start - start.getTime() >= slotDurationMs) {
          allPossibleSlots.push({
            start: start,
            end: new Date(events[0].start),
          });
        }

        for (let i = 0; i < events.length - 1; i++) {
          const gap = events[i + 1].start - events[i].end;
          if (gap >= slotDurationMs) {
            allPossibleSlots.push({
              start: new Date(events[i].end),
              end: new Date(events[i + 1].start),
            });
          }
        }

        if (end.getTime() - events[events.length - 1].end >= slotDurationMs) {
          allPossibleSlots.push({
            start: new Date(events[events.length - 1].end),
            end: end,
          });
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const suggestedSlots = allPossibleSlots.filter(slot => {
    const slotStart = slot.start.getTime() + 1;
    const slotEnd = slot.end.getTime() - 1;
    return intervalTree.search(slotStart, slotEnd).length === 0;
  });

  return suggestedSlots;
}

/**
 * getEventsFromCalendar retrieves the events from a calendar.
 * Defaults to the default calendar.
 */
function getEventsFromCalendar({ calendarId, from, to }: GetCalendarParams) {
  let calendar: GoogleAppsScript.Calendar.Calendar;

  if (!calendarId) {
    calendar = CalendarApp.getDefaultCalendar();
  } else {
    calendar = CalendarApp.getCalendarById(calendarId);
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const events = calendar.getEvents(from, to);

  return events.map(event => ({
    timeStart: event.getStartTime().getTime(),
    timeEnd: event.getEndTime().getTime(),
  }));
}

/**
 * getStartAndEndOfDay returns the start and end of a day.
 * @param date The date to get the start and end of.
 * @returns An object with the start and end of the day.
 */
function getStartAndEndOfDay(date: Date, params: GetSlotsParams) {
  const start = new Date(date);
  start.setHours(
    params.daily?.from?.[0] || 9,
    params.daily?.from?.[1] || 0,
    params.daily?.from?.[2] || 0
  );

  const end = new Date(date);
  end.setHours(
    params.daily?.to?.[0] || 17,
    params.daily?.to?.[1] || 0,
    params.daily?.to?.[2] || 0
  );

  return { start, end };
}

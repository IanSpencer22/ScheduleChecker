import { Client } from "@microsoft/microsoft-graph-client";
import { CalendarEvent, AvailabilityRequest, AvailabilityResult, TimeSlot } from "../types/calendar";
import { format, parseISO, startOfDay, endOfDay, addMinutes, isWithinInterval, isSameDay, differenceInMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export class CalendarService {
  private graphClient: Client;

  constructor(accessToken: string) {
    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const response = await this.graphClient
        .api('/me/calendarView')
        .query({
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          $orderby: 'start/dateTime',
        })
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  calculateAvailability(request: AvailabilityRequest, events: CalendarEvent[], timeZone: string): AvailabilityResult[] {
    const results: AvailabilityResult[] = [];
    const currentDate = new Date(request.startDate);

    while (currentDate <= request.endDate) {
      if (request.daysOfWeek.includes(currentDate.getDay())) {
        let allAvailableSlots: { start: Date; end: Date; isAvailable: boolean }[] = [];
        let allBusySlots: TimeSlot[] = [];
        for (const window of request.timeWindows) {
          const dayStart = startOfDay(currentDate);
          const [startHour, startMinute] = window.startTime.split(':').map(Number);
          const [endHour, endMinute] = window.endTime.split(':').map(Number);
          const availableStart = new Date(dayStart);
          availableStart.setHours(startHour, startMinute, 0, 0);
          const availableEnd = new Date(dayStart);
          availableEnd.setHours(endHour, endMinute, 0, 0);

          // Filter events that overlap the selected window (regardless of start date)
          const dayEvents = events.filter(event => {
            const eventStart = adjustByMinus5Hours(toZonedTime(parseISO(event.start.dateTime), timeZone));
            const eventEnd = adjustByMinus5Hours(toZonedTime(parseISO(event.end.dateTime), timeZone));
            return (
              isSameDay(eventStart, currentDate) ||
              (eventStart < availableEnd && eventEnd > availableStart &&
                (isSameDay(eventEnd, currentDate) ||
                 (eventStart < availableEnd && eventEnd > availableStart &&
                  eventStart <= availableEnd && eventEnd >= availableStart)))
            );
          }).filter(event => {
            const eventStart = adjustByMinus5Hours(toZonedTime(parseISO(event.start.dateTime), timeZone));
            const eventEnd = adjustByMinus5Hours(toZonedTime(parseISO(event.end.dateTime), timeZone));
            return eventEnd > availableStart && eventStart < availableEnd;
          });

          // Sort events by start time
          dayEvents.sort((a, b) => {
            const aStart = adjustByMinus5Hours(toZonedTime(parseISO(a.start.dateTime), timeZone)).getTime();
            const bStart = adjustByMinus5Hours(toZonedTime(parseISO(b.start.dateTime), timeZone)).getTime();
            return aStart - bStart;
          });

          // Build busy slots as actual event blocks, clipped to the window
          const busySlots = dayEvents.map(event => {
            const eventStart = adjustByMinus5Hours(toZonedTime(parseISO(event.start.dateTime), timeZone));
            const eventEnd = adjustByMinus5Hours(toZonedTime(parseISO(event.end.dateTime), timeZone));
            // Clip event to the available window
            const clippedStart = eventStart < availableStart ? availableStart : eventStart;
            const clippedEnd = eventEnd > availableEnd ? availableEnd : eventEnd;
            return {
              start: clippedStart,
              end: clippedEnd,
              isAvailable: false,
              event: event
            };
          });

          // Generate 30-min available slots, skipping busy times
          const slotDuration = 30; // minutes
          let slots: { start: Date; end: Date; isAvailable: boolean }[] = [];
          let slotStart = new Date(availableStart);
          while (slotStart < availableEnd) {
            let slotEnd = addMinutes(slotStart, slotDuration);
            if (slotEnd > availableEnd) slotEnd = new Date(availableEnd);
            // Check if this slot overlaps any busy slot
            const isBusy = busySlots.some(busy =>
              (slotStart < busy.end && slotEnd > busy.start)
            );
            slots.push({
              start: new Date(slotStart),
              end: new Date(slotEnd),
              isAvailable: !isBusy
            });
            slotStart = slotEnd;
          }
          // Merge consecutive available slots WITHIN THIS WINDOW ONLY
          const availableSlots: { start: Date; end: Date; isAvailable: boolean }[] = [];
          let current: { start: Date; end: Date; isAvailable: boolean } | null = null;
          for (const slot of slots) {
            if (slot.isAvailable) {
              if (!current) {
                current = { ...slot };
              } else {
                // Extend the current slot
                current.end = slot.end;
              }
            } else {
              if (current) {
                availableSlots.push(current);
                current = null;
              }
            }
          }
          if (current) availableSlots.push(current);
          allAvailableSlots = allAvailableSlots.concat(availableSlots);
          allBusySlots = allBusySlots.concat(busySlots);
        }
        // Do NOT merge available slots across windows, just sort for display
        allAvailableSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
        // Merge overlapping busy slots globally
        allBusySlots.sort((a, b) => a.start.getTime() - b.start.getTime());
        const mergedBusySlots: TimeSlot[] = [];
        let busyCurrent: TimeSlot | null = null;
        for (const slot of allBusySlots) {
          if (!busyCurrent) {
            busyCurrent = { ...slot };
          } else if (slot.start <= busyCurrent.end) {
            // Overlapping or consecutive, merge
            busyCurrent.end = slot.end > busyCurrent.end ? slot.end : busyCurrent.end;
          } else {
            mergedBusySlots.push(busyCurrent);
            busyCurrent = { ...slot };
          }
        }
        if (busyCurrent) mergedBusySlots.push(busyCurrent);
        results.push({
          date: new Date(currentDate),
          availableSlots: allAvailableSlots,
          busySlots: mergedBusySlots
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return results;
  }

  private generateTimeSlots(start: Date, end: Date, events: CalendarEvent[]): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const slotDuration = 30; // 30-minute slots
    let currentTime = new Date(start);

    while (currentTime < end) {
      const slotEnd = addMinutes(currentTime, slotDuration);
      const slotStart = new Date(currentTime);
      
      // Check if this slot conflicts with any events
      const conflictingEvent = events.find(event => {
        const eventStart = parseISO(event.start.dateTime);
        const eventEnd = parseISO(event.end.dateTime);
        
        return (
          (slotStart < eventEnd && slotEnd > eventStart) ||
          (eventStart < slotEnd && eventEnd > slotStart)
        );
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        isAvailable: !conflictingEvent,
        event: conflictingEvent
      });

      currentTime = slotEnd;
    }

    return slots;
  }
}

function adjustByMinus5Hours(date: Date): Date {
  return new Date(date.getTime() - 5 * 60 * 60 * 1000);
} 
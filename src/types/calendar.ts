export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay: boolean;
  location?: {
    displayName: string;
  };
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  event?: CalendarEvent;
}

export interface TimeWindow {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface AvailabilityRequest {
  startDate: Date;
  endDate: Date;
  timeWindows: TimeWindow[];
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface AvailabilityResult {
  date: Date;
  availableSlots: TimeSlot[];
  busySlots: TimeSlot[];
} 
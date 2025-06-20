import React from 'react';
import { AvailabilityResult } from '../types/calendar';
import { format, differenceInMinutes } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface AvailabilityDisplayProps {
  results: AvailabilityResult[];
}

const AvailabilityDisplay: React.FC<AvailabilityDisplayProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No availability data
        </h3>
        <p className="text-gray-600">
          Select a date range and time period to see your availability
        </p>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getDayName = (date: Date) => {
    return format(date, 'EEEE');
  };

  const getDateString = (date: Date) => {
    return format(date, 'MMM d');
  };

  const groupConsecutiveSlots = (slots: AvailabilityResult['availableSlots']) => {
    if (slots.length === 0) return [];
    
    const groups = [];
    let currentGroup = [slots[0]];
    
    for (let i = 1; i < slots.length; i++) {
      const currentSlot = slots[i];
      const lastSlot = currentGroup[currentGroup.length - 1];
      
      // Check if slots are consecutive (30-minute intervals)
      const timeDiff = currentSlot.start.getTime() - lastSlot.end.getTime();
      if (timeDiff === 0) {
        currentGroup.push(currentSlot);
      } else {
        groups.push(currentGroup);
        currentGroup = [currentSlot];
      }
    }
    
    groups.push(currentGroup);
    return groups;
  };

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const availableGroups: import('../types/calendar').TimeSlot[] = result.availableSlots;
        const busyGroups: import('../types/calendar').TimeSlot[] = result.busySlots;
        const hasAvailability = availableGroups.length > 0;
        // Calculate total 30-min slots for available and busy
        const availableSlotCount = availableGroups.reduce((sum, slot) => sum + Math.ceil(differenceInMinutes(slot.end, slot.start) / 30), 0);
        const busySlotCount = busyGroups.reduce((sum, slot) => sum + Math.ceil(differenceInMinutes(slot.end, slot.start) / 30), 0);
        
        return (
          <div key={result.date.toISOString()} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getDayName(result.date)}
                </h3>
                <p className="text-gray-600">{getDateString(result.date)}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {availableSlotCount} available slots
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {busySlotCount} busy slots
                  </span>
                </div>
              </div>
            </div>

            {hasAvailability ? (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-gray-900">Available Times:</h4>
                <div className="grid gap-2">
                  {availableGroups.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        <span className="text-sm text-green-600">
                          ({differenceInMinutes(slot.end, slot.start)} minutes)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600">No available time slots for this day</p>
              </div>
            )}

            {busyGroups.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Busy Times:</h4>
                <div className="grid gap-2">
                  {busyGroups.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </span>
                        </div>
                        {slot.event && (
                          <span className="text-sm text-red-600 truncate max-w-xs">
                            {slot.event.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityDisplay; 
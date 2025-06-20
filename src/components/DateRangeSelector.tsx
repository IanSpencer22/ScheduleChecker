import React from 'react';
import { AvailabilityRequest, TimeWindow } from '../types/calendar';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeSelectorProps {
  request: AvailabilityRequest;
  onRequestChange: (request: AvailabilityRequest) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ request, onRequestChange }) => {
  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onRequestChange({
      ...request,
      [field]: new Date(value)
    });
  };

  const handleTimeChange = (windowIdx: number, field: 'startTime' | 'endTime', value: string) => {
    const newWindows = request.timeWindows.map((tw, idx) =>
      idx === windowIdx ? { ...tw, [field]: value } : tw
    );
    onRequestChange({
      ...request,
      timeWindows: newWindows
    });
  };

  const handleDayToggle = (dayValue: number) => {
    const newDays = request.daysOfWeek.includes(dayValue)
      ? request.daysOfWeek.filter(d => d !== dayValue)
      : [...request.daysOfWeek, dayValue].sort();
    
    onRequestChange({
      ...request,
      daysOfWeek: newDays
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentStart = new Date(request.startDate);
    const newStart = direction === 'prev' 
      ? subDays(currentStart, 7) 
      : addDays(currentStart, 7);
    
    onRequestChange({
      ...request,
      startDate: newStart,
      endDate: addDays(newStart, 6)
    });
  };

  const goToCurrentWeek = () => {
    const currentWeekStart = startOfWeek(new Date());
    onRequestChange({
      ...request,
      startDate: currentWeekStart,
      endDate: addDays(currentWeekStart, 6)
    });
  };

  const addTimeWindow = () => {
    if (request.timeWindows.length < 2) {
      onRequestChange({
        ...request,
        timeWindows: [...request.timeWindows, { startTime: '13:00', endTime: '17:00' }]
      });
    }
  };

  const removeTimeWindow = () => {
    if (request.timeWindows.length > 1) {
      onRequestChange({
        ...request,
        timeWindows: request.timeWindows.slice(0, 1)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d, yyyy')}
          </h3>
          <button
            onClick={goToCurrentWeek}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Go to current week
          </button>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of Week Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Days to check
        </label>
        <div className="flex gap-2">
          {daysOfWeek.map(day => (
            <button
              key={day.value}
              onClick={() => handleDayToggle(day.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                request.daysOfWeek.includes(day.value)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {request.timeWindows.map((tw, idx) => (
          <React.Fragment key={idx}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time {request.timeWindows.length > 1 ? `(${idx + 1})` : ''}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={tw.startTime}
                  onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time {request.timeWindows.length > 1 ? `(${idx + 1})` : ''}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={tw.endTime}
                  onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {request.timeWindows.length < 2 && (
          <button
            type="button"
            onClick={addTimeWindow}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Add another time slot
          </button>
        )}
        {request.timeWindows.length > 1 && (
          <button
            type="button"
            onClick={removeTimeWindow}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Remove second time slot
          </button>
        )}
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={format(request.startDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={format(request.endDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector; 
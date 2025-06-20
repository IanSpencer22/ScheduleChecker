import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import { CalendarService } from '../services/calendarService';
import { AvailabilityRequest, AvailabilityResult } from '../types/calendar';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar, Clock, LogIn, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import AvailabilityDisplay from './AvailabilityDisplay';
import DateRangeSelector from './DateRangeSelector';
import TimeZoneSelector from './TimeZoneSelector';

const CalendarAvailability: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  const [availabilityRequest, setAvailabilityRequest] = useState<AvailabilityRequest>({
    startDate: startOfWeek(new Date()),
    endDate: addDays(startOfWeek(new Date()), 6),
    timeWindows: [
      { startTime: '16:00', endTime: '19:00' },
      { startTime: '20:00', endTime: '21:00' }
    ],
    daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
  });

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error('Login failed:', e);
      setError('Login failed. Please try again.');
    });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error('Logout failed:', e);
    });
  };

  const fetchAvailability = async () => {
    if (!accounts[0]) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });

      const calendarService = new CalendarService(response.accessToken);
      const events = await calendarService.getCalendarEvents(
        availabilityRequest.startDate,
        availabilityRequest.endDate
      );

      const results = calendarService.calculateAvailability(availabilityRequest, events, timeZone);
      setAvailabilityResults(results);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to fetch calendar data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchAvailability();
    }
  }, [accounts.length, availabilityRequest, timeZone]);

  if (accounts.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sign in to check your availability
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your Outlook calendar to see your free time at a glance
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <TimeZoneSelector value={timeZone} onChange={setTimeZone} />
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome, {accounts[0]?.name || 'User'}
            </h2>
            <p className="text-gray-600">
              Check your availability for the selected time period
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <DateRangeSelector
          request={availabilityRequest}
          onRequestChange={setAvailabilityRequest}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
        </div>
      ) : (
        <AvailabilityDisplay results={availabilityResults} />
      )}
    </div>
  );
};

export default CalendarAvailability; 
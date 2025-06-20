import React from 'react';

const COMMON_TIMEZONES = [
  'America/New_York', // Eastern
  'America/Chicago',  // Central
  'America/Denver',   // Mountain
  'America/Los_Angeles', // Pacific
  'America/Phoenix',  // Arizona
  'America/Anchorage', // Alaska
  'Pacific/Honolulu', // Hawaii
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

interface TimeZoneSelectorProps {
  value: string;
  onChange: (tz: string) => void;
}

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {COMMON_TIMEZONES.map(tz => (
          <option key={tz} value={tz}>{tz}</option>
        ))}
      </select>
    </div>
  );
};

export default TimeZoneSelector; 
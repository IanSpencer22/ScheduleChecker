# Schedule Checker (Currently live at https://www.ianbuilds.dev/)

A modern web application that helps you quickly check your availability by integrating with your Outlook calendar. See your free time at a glance without having to manually scan through your busy calendar.

## Features

- 🔐 **Microsoft Authentication**: Secure login with your Microsoft account
- 📅 **Outlook Integration**: Direct integration with Microsoft Graph API
- 🕒 **Flexible Time Selection**: Choose custom date ranges and time periods
- 📊 **Visual Availability Display**: Clear view of available and busy time slots
- 🎯 **Day Filtering**: Select specific days of the week to check
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: Automatically refreshes when you change settings

## Prerequisites

Before running this application, you'll need:

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn**
3. **Microsoft Azure App Registration** (for Outlook calendar access)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd scheduleChecker
npm install
```

### 2. Microsoft Azure App Registration

To integrate with Outlook calendar, you need to register an application in Azure:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Schedule Checker
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: `http://localhost:3000` (for development)
5. After registration, note down the **Application (client) ID**

### 3. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `Calendars.Read`
6. Click **Grant admin consent**

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_CLIENT_ID=your-client-id-from-azure
```

Replace `your-client-id-from-azure` with the Application (client) ID from step 2.

### 5. Start the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

### 1. Sign In
- Click "Sign in with Microsoft" to authenticate with your Microsoft account
- Grant the necessary permissions when prompted

### 2. Configure Your Search
- **Date Range**: Select the start and end dates for your availability check
- **Time Period**: Set the start and end times for each day
- **Days of Week**: Choose which days to include in your search
- **Week Navigation**: Use the arrow buttons to navigate between weeks

### 3. View Results
- Available time slots are shown in green
- Busy time slots are shown in red with event details
- Time slots are grouped into consecutive periods for easier reading

## Features in Detail

### Time Slot Calculation
- The app divides your selected time period into 30-minute slots
- Each slot is checked against your calendar events
- Consecutive available slots are grouped together for better readability

### Smart Filtering
- Only shows results for the days you've selected
- Respects your specified time constraints
- Handles all-day events appropriately

### Visual Indicators
- ✅ Green: Available time slots
- ❌ Red: Busy time slots with event details
- 📊 Summary counts for quick overview

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Microsoft Authentication Library (MSAL)
- **Calendar API**: Microsoft Graph API
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Project Structure

```
src/
├── components/          # React components
│   ├── CalendarAvailability.tsx
│   ├── DateRangeSelector.tsx
│   └── AvailabilityDisplay.tsx
├── config/             # Configuration files
│   └── authConfig.ts
├── services/           # API services
│   └── calendarService.ts
├── types/              # TypeScript type definitions
│   └── calendar.ts
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure your Azure app registration is configured correctly
   - Check that the redirect URI matches your development URL
   - Verify API permissions are granted

2. **Calendar Not Loading**
   - Make sure you have calendar events in the selected date range
   - Check that your Microsoft account has calendar access
   - Verify the time zone settings

3. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check that your Node.js version is compatible
   - Clear node_modules and reinstall if needed

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Azure app registration settings
3. Ensure your Microsoft account has calendar permissions
4. Check that the environment variables are set correctly

## Security Notes

- The application only requests read permissions for your calendar
- No calendar data is stored locally or transmitted to third parties
- Authentication tokens are stored securely in session storage
- The app follows Microsoft's security best practices

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 
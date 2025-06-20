# Setup Guide for Schedule Checker

## Prerequisites Installation

### 1. Install Node.js

**Option A: Download from Official Website**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Verify installation by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

**Option B: Using Chocolatey (Windows)**
```bash
choco install nodejs
```

**Option C: Using Winget (Windows 10/11)**
```bash
winget install OpenJS.NodeJS
```

### 2. Verify Installation
After installing Node.js, open a new terminal and run:
```bash
node --version  # Should show v16.x.x or higher
npm --version   # Should show 8.x.x or higher
```

## Application Setup

### 1. Install Dependencies
```bash
cd scheduleChecker
npm install
```

### 2. Microsoft Azure Configuration

#### Step 1: Create Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Schedule Checker
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: Single-page application (SPA)
     - URI: `http://localhost:3000`
5. Click **Register**
6. Copy the **Application (client) ID** - you'll need this for the next step

#### Step 2: Configure API Permissions
1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Search for and add these permissions:
   - `User.Read`
   - `Calendars.Read`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

#### Step 3: Create Environment File
1. In the `scheduleChecker` directory, create a file named `.env`
2. Add the following content:
   ```
   REACT_APP_CLIENT_ID=your-client-id-from-azure
   ```
3. Replace `your-client-id-from-azure` with the Application (client) ID from Step 1

### 3. Start the Application
```bash
npm start
```

The application will open at `http://localhost:3000`

## Troubleshooting

### Node.js Installation Issues
- **"node is not recognized"**: Restart your terminal after installation
- **Permission errors**: Run terminal as administrator
- **Path issues**: Ensure Node.js is added to your system PATH

### Azure Configuration Issues
- **Authentication errors**: Double-check your client ID and redirect URI
- **Permission errors**: Ensure you've granted admin consent for the API permissions
- **Redirect URI mismatch**: Make sure the URI in Azure matches exactly: `http://localhost:3000`

### Application Issues
- **Build errors**: Try deleting `node_modules` and running `npm install` again
- **Port conflicts**: If port 3000 is busy, the app will automatically try port 3001
- **CORS errors**: Ensure your Azure app registration has the correct redirect URI

## Alternative Setup Methods

### Using Yarn (if npm has issues)
```bash
npm install -g yarn
yarn install
yarn start
```

### Using npx (if you don't want to install globally)
```bash
npx create-react-app scheduleChecker --template typescript
cd scheduleChecker
# Then follow the Azure configuration steps above
```

## Next Steps

After successful setup:
1. Open the application in your browser
2. Click "Sign in with Microsoft"
3. Grant calendar permissions when prompted
4. Configure your date range and time preferences
5. View your availability!

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all prerequisites are installed correctly
3. Ensure Azure configuration is complete
4. Check that your Microsoft account has calendar access 
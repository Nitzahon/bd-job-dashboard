# Technical Requirements Implementation - Testing Guide

This document outlines how to test the three technical requirements that have been implemented:

## 📋 Requirements Implemented

✅ **Support real time job updates with SignalR**
✅ **Configuration for switching between mock data and real API services**  
✅ **Handle API errors and SignalR disconnects gracefully (e.g., retry, user feedback)**

## 🚀 Testing the Implementation

### 1. Mock Service Testing (Default)

The application starts with mock data by default:

```bash
# Start the application
npm start
```

**What to test:**
- Job operations work normally (create, stop, restart, delete)
- Status cards update in real-time
- No network errors since everything is mocked
- ConfigToggle shows "Mock Data" mode

### 2. Real API Service Testing

To test with real API services:

```bash
# Create/update .env file in project root
echo "REACT_APP_USE_MOCK_DATA=false" > .env
echo "REACT_APP_API_BASE_URL=https://your-api-server.com/api" >> .env
echo "REACT_APP_SIGNALR_HUB_URL=https://your-api-server.com/jobHub" >> .env

# Restart the application
npm start
```

**What to test:**
- ConfigToggle shows "Real API" mode
- Network requests are made to actual endpoints
- SignalR connection attempts are visible in browser dev tools
- Error notifications appear for failed requests

### 3. Error Handling Testing

#### Simulate Network Errors:
1. Open Browser Dev Tools → Network tab
2. Set network throttling to "Offline"
3. Try job operations and observe:
   - Error notifications appear
   - Retry buttons are available
   - Connection status shows "Disconnected"

#### Simulate API Errors:
1. Use invalid API URLs in .env:
   ```
   REACT_APP_API_BASE_URL=https://invalid-api.com/api
   ```
2. Restart and observe error handling

### 4. Service Switching Testing

The ConfigToggle component shows current service mode and provides instructions for switching:

1. Click the "Switch to Real API" button
2. Follow the instructions shown in the alert
3. Restart the application
4. Verify the service mode has changed

## 🏗️ Implementation Architecture

### Service Layer
- **IJobService**: Abstract interface for job operations
- **MockJobService**: In-memory mock implementation
- **RealJobService**: SignalR + REST API implementation
- **JobServiceFactory**: Singleton factory for service switching

### Error Handling
- **ErrorContext**: Global error state management
- **ErrorNotifications**: User-facing error display
- **Retry Logic**: Exponential backoff for failed requests
- **Connection Monitoring**: SignalR connection state tracking

### Real-time Updates
- **SignalR Hub**: Job progress updates
- **Automatic Reconnection**: Handle disconnects gracefully
- **Progress Callbacks**: Real-time job status updates

## 🔧 Configuration

Environment variables in `.env`:

```env
# Service Selection
REACT_APP_USE_MOCK_DATA=true|false

# Real API Configuration (when REACT_APP_USE_MOCK_DATA=false)
REACT_APP_API_BASE_URL=https://your-api-server.com/api
REACT_APP_SIGNALR_HUB_URL=https://your-api-server.com/jobHub

# Retry Configuration (optional)
REACT_APP_MAX_RETRIES=3
REACT_APP_RETRY_DELAY=1000
```

## 🧪 Browser Testing

### Console Logs
Monitor browser console for:
- Service initialization messages
- SignalR connection events
- API request/response logs
- Error messages and retry attempts

### Network Tab
Watch for:
- REST API calls to job endpoints
- SignalR WebSocket connection
- Failed requests and retry attempts

### Local Storage
The error context may store connection state and error history.

## 📱 User Experience Testing

### Happy Path
1. Load application → Mock data loads immediately
2. Create job → Job appears with progress updates
3. Stop/restart jobs → Immediate UI feedback
4. Switch services → Clear instructions provided

### Error Path
1. Network failure → Error notification appears
2. Click retry → Request attempted again
3. SignalR disconnect → Connection status updates
4. Multiple errors → Notifications queue properly

## 🎯 Validation Checklist

- [ ] Mock service works without network dependencies
- [ ] Real service configuration switches properly
- [ ] SignalR connection attempts are made in real mode
- [ ] Error notifications appear for failed operations
- [ ] Retry logic works with exponential backoff
- [ ] Connection status reflects SignalR state
- [ ] Service switching instructions are clear
- [ ] All job operations handle errors gracefully
- [ ] TypeScript compilation succeeds
- [ ] No console errors in happy path

## 🔍 Troubleshooting

### Common Issues
1. **"Button component not found"** → UI component library may need completion
2. **"SignalR connection failed"** → Expected when no real backend is available
3. **"Environment variables not loaded"** → Restart application after .env changes
4. **"Service factory errors"** → Check service interface implementations

### Debug Mode
Add to .env for verbose logging:
```env
REACT_APP_DEBUG=true
```

This comprehensive implementation fulfills all three technical requirements with production-ready error handling, service abstraction, and real-time communication capabilities.

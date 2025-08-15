# Technical Requirements Implementation Test Guide

This guide covers testing the three technical requirements that were implemented:

## 1. SignalR Real-time Job Updates

### Test Scenarios:
- **Connection Management**: Start the app and verify SignalR connection status in the ConfigToggle component
- **Real-time Progress**: Create a job and observe real-time progress updates (simulated in mock mode)
- **Connection Recovery**: Simulate network interruption and verify automatic reconnection
- **Hub Events**: Test various SignalR hub events (JobProgressUpdated, JobCompleted, JobFailed)

### Testing Steps:
1. Set `REACT_APP_USE_MOCK_DATA=false` in .env
2. Start the application
3. Monitor browser console for SignalR connection logs
4. Create a new job and watch for real-time updates
5. Check connection status indicator in the UI

## 2. Mock/Real API Service Configuration

### Test Scenarios:
- **Mock Service**: Default behavior with simulated data and SignalR events
- **Real Service**: Production API calls with actual SignalR hub
- **Runtime Switching**: Configuration changes and service factory behavior
- **Service Isolation**: Proper abstraction between mock and real implementations

### Testing Steps:

#### Mock Service Testing:
```bash
# In .env file
REACT_APP_USE_MOCK_DATA=true

# Start application
npm start
```
- Verify mock data appears in job table
- Test all CRUD operations (Create, Read, Update, Delete)
- Confirm simulated progress updates work
- Check that no real API calls are made (Network tab)

#### Real Service Testing:
```bash
# In .env file
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_BASE_URL=https://your-api-url.com
REACT_APP_SIGNALR_HUB_URL=https://your-api-url.com/jobHub

# Start application
npm start
```
- Verify real API calls are made
- Test SignalR connection to actual hub
- Confirm error handling for real network issues
- Check authentication if required

## 3. Error Handling and Graceful Degradation

### Test Scenarios:
- **API Errors**: Network failures, 404s, 500s, timeouts
- **SignalR Disconnects**: Connection drops, hub unavailable, reconnection failures
- **Retry Logic**: Exponential backoff, maximum retry attempts
- **User Feedback**: Error notifications, retry buttons, connection status

### Testing Steps:

#### Network Error Testing:
1. Disconnect internet while app is running
2. Verify error notifications appear
3. Check that retry buttons work
4. Confirm connection status updates correctly

#### API Error Simulation:
```bash
# Mock invalid API URL in .env
REACT_APP_API_BASE_URL=https://invalid-url-that-does-not-exist.com

# Start application and test error handling
npm start
```

#### SignalR Error Testing:
```bash
# Mock invalid SignalR URL in .env
REACT_APP_SIGNALR_HUB_URL=wss://invalid-signalr-hub.com/jobHub

# Start application and test SignalR error handling
npm start
```

### Error Scenarios to Test:
1. **Initial Connection Failure**: Invalid URLs, network down
2. **Runtime Disconnection**: Network interruption during operation
3. **API Rate Limiting**: Too many requests (if applicable)
4. **Malformed Responses**: Invalid JSON or unexpected data structure
5. **Authentication Errors**: 401/403 responses (if auth is implemented)

## Expected Behaviors

### ✅ Success Indicators:
- Real-time job progress updates appear without page refresh
- Service switching works by changing .env and restarting
- Error notifications show with retry options
- Connection status indicator reflects actual state
- Failed operations can be retried successfully
- App remains functional even with network issues

### 🚨 Error Indicators:
- No real-time updates (SignalR connection failed)
- Service factory not switching between implementations
- Errors not caught or displayed to users
- No retry mechanism for failed operations
- App crashes on network errors

## Performance Testing

### Load Testing:
- Create multiple jobs simultaneously
- Test with large job lists (100+ items)
- Monitor memory usage during long SignalR sessions
- Check for memory leaks in error handling

### Browser Compatibility:
- Test SignalR WebSocket fallbacks
- Verify error handling across different browsers
- Check mobile responsiveness of error notifications

## Development Tools

### Debugging:
```bash
# Enable verbose logging
localStorage.setItem('debug', 'signalr:*');

# Check service factory state
console.log(JobServiceFactory.getCurrentConfig());

# Monitor error context
// Check ErrorNotifications component state in React DevTools
```

### Chrome DevTools:
- **Network Tab**: Monitor API calls and WebSocket connections
- **Console**: Check for SignalR connection logs and errors
- **Application Tab**: Verify localStorage/sessionStorage usage
- **Performance Tab**: Monitor for memory leaks

## Integration Testing

### End-to-End Scenarios:
1. **Full Job Lifecycle**: Create → Monitor Progress → Complete → Delete
2. **Error Recovery**: Network failure → Reconnection → Resume operations
3. **Service Switching**: Mock → Real → Back to Mock (with restart)
4. **Bulk Operations**: Multi-select delete with error handling

### Automated Testing:
The existing test files can be extended to cover:
- Service factory behavior
- Error context state management
- SignalR connection mocking
- Retry logic validation

## Production Readiness Checklist

### ✅ Before Deployment:
- [ ] Real API endpoints configured and tested
- [ ] SignalR hub URL verified and accessible
- [ ] Error logging integrated (optional)
- [ ] Performance monitoring setup (optional)
- [ ] Authentication flow tested (if applicable)
- [ ] CORS policies configured for API
- [ ] WebSocket connections allowed through firewall
- [ ] SSL certificates valid for SignalR hub

### Configuration Management:
- Use environment-specific .env files
- Implement proper secrets management for production
- Consider feature flags for service switching
- Set up monitoring for connection health

## Troubleshooting Common Issues

### SignalR Connection Issues:
```
Error: Failed to start the connection: Error: WebSocket failed to connect
```
**Solution**: Check CORS policy, verify URL, ensure WebSocket is enabled

### Service Factory Issues:
```
Error: Service not initialized
```
**Solution**: Verify .env variables are loaded, check service factory singleton

### Error Context Issues:
```
Error: Cannot read property 'addError' of undefined
```
**Solution**: Ensure ErrorProvider wraps the component tree properly

This comprehensive testing approach ensures all three technical requirements are properly implemented and production-ready.

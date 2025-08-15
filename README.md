# Job Dashboard - Senior Frontend Developer Assessment

A real-time Job Management Dashboard built with React TypeScript that monitors and controls distributed job processing with comprehensive error handling, service abstraction, and SignalR integration.

## 🚀 Features Implemented

- **Real-time Job Updates**: SignalR integration for live job progress monitoring
- **Service Abstraction**: Seamless switching between mock data and real API services
- **Comprehensive Error Handling**: Graceful handling of API errors and SignalR disconnects with retry logic
- **Responsive UI**: Mobile-first design with full responsive layout
- **Internationalization**: English and Hebrew support with RTL layout
- **TypeScript**: Fully typed React application with strict type checking

## 📋 Technical Requirements Fulfilled

✅ **Complete React TypeScript application**  
✅ **Configuration support for switching between mock/real APIs and socket events**  
✅ **Responsive UI with mobile-first design**  
✅ **Comprehensive setup and configuration guide**

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bd-job-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000` (or the next available port).

## ⚙️ Configuration Guide: Switching Between Mock and Real Services

The application supports two service modes:

### Mock Data Mode (Default)
Perfect for development and testing without backend dependencies.

**Configuration:**
```env
# .env file
REACT_APP_USE_MOCK_DATA=true
```

**Features:**
- Simulated job operations with realistic delays
- Mock SignalR events for progress updates
- No network dependencies
- Instant startup

### Real API Mode
Connects to actual backend services with SignalR hub.

**Configuration:**
```env
# .env file
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_BASE_URL=https://localhost:5001/api
REACT_APP_SIGNALR_HUB_URL=https://localhost:5001/JobSignalRHub
```

**Additional Options:**
```env
# Optional: Error handling configuration
REACT_APP_MAX_RETRIES=3
REACT_APP_RETRY_DELAY=1000

# Optional: Debug mode for verbose logging
REACT_APP_DEBUG=true
```

### Switching Services

1. **Update the `.env` file** with desired configuration
2. **Restart the development server** (`Ctrl+C` then `npm start`)
3. **Verify the change** in the ConfigToggle component (top of dashboard)

### Visual Service Indicator

The application includes a **ConfigToggle** component that displays:
- Current service mode (Mock Data / Real API)
- API endpoints being used
- Switch instructions

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Components  │  Modals  │  Error Notifications│
├─────────────────────────────────────────────────────────────┤
│                     Context Layer                           │
├─────────────────────────────────────────────────────────────┤
│   JobContext   │   ErrorContext   │   LanguageContext       │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│                JobServiceFactory                            │
│    ┌─────────────────┐      ┌─────────────────┐             │
│    │  MockJobService │      │  RealJobService │             │
│    │                 │      │                 │             │
│    │ • In-memory     │      │ • REST API      │             │
│    │ • Simulated     │      │ • SignalR Hub   │             │
│    │ • No network    │      │ • Real-time     │             │
│    └─────────────────┘      └─────────────────┘             │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure                          │
├─────────────────────────────────────────────────────────────┤
│  Error Handling  │  Retry Logic  │  Connection Monitoring   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Components

1. **Service Abstraction Layer**
   - `IJobService`: Common interface for all job operations
   - `JobServiceFactory`: Singleton factory for service selection
   - Seamless switching between mock and real implementations

2. **Error Management System**
   - `ErrorContext`: Global error state management
   - `ErrorNotifications`: User-facing error display
   - Exponential backoff retry logic
   - Connection state monitoring

3. **Real-time Communication**
   - SignalR Hub integration
   - Automatic reconnection handling
   - Progress update callbacks

## 🧪 Testing Different Modes

### Mock Mode Testing
```bash
# Ensure mock mode is enabled
echo "REACT_APP_USE_MOCK_DATA=true" > .env
npm start
```

**Test scenarios:**
- Create jobs → Immediate response
- Progress updates → Simulated real-time updates
- Error handling → Simulated network errors (rare)
- All operations work offline

### Real API Mode Testing
```bash
# Configure for real API
echo "REACT_APP_USE_MOCK_DATA=false" > .env
echo "REACT_APP_API_BASE_URL=https://localhost:5001/api" >> .env
echo "REACT_APP_SIGNALR_HUB_URL=https://localhost:5001/JobSignalRHub" >> .env
npm start
```

**Test scenarios:**
- Network requests → Visible in browser DevTools
- SignalR connection → WebSocket connection attempts
- Error handling → Real network failure responses
- Retry logic → Automatic retry with exponential backoff

### Error Handling Testing
1. **Network Simulation**: Use browser DevTools → Network → Offline
2. **Invalid URLs**: Set incorrect API URLs in `.env`
3. **Connection Issues**: Disconnect from internet

**Expected behavior:**
- Error notifications appear
- Retry buttons are functional
- Connection status updates
- Graceful degradation

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Key responsive features:
- Adaptive grid layouts
- Mobile-optimized modals
- Touch-friendly interactions
- Collapsible navigation elements

## 🌐 Internationalization

Supports English and Hebrew with:
- Complete translation coverage
- RTL layout support
- Language switching component
- Locale-aware formatting

Switch languages using the language toggle in the header.

## 🚨 Error Handling Features

- **Automatic Retry**: Failed requests retry with exponential backoff
- **User Feedback**: Clear error notifications with actionable buttons
- **Connection Monitoring**: Real-time connection status display
- **Graceful Degradation**: Application remains functional during network issues

## 📦 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Testing Configurations
```bash
# Quick mock mode test
npm run start:mock

# Quick real API mode test (requires backend)
npm run start:real
```

## 🔧 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_USE_MOCK_DATA` | Service mode selection | `true` | Yes |
| `REACT_APP_API_BASE_URL` | Real API base URL | - | When mock=false |
| `REACT_APP_SIGNALR_HUB_URL` | SignalR hub URL | - | When mock=false |
| `REACT_APP_MAX_RETRIES` | Maximum retry attempts | `3` | No |
| `REACT_APP_RETRY_DELAY` | Initial retry delay (ms) | `1000` | No |
| `REACT_APP_DEBUG` | Enable debug logging | `false` | No |

## 📋 Project Structure

```
src/
├── components/          # React components
│   ├── common/             # Reusable UI components
│   ├── Dashboard/   # Main dashboard component
│   ├── ConfigToggle/ # Service mode indicator
│   └── ...
├── context/            # React contexts
│   ├── JobContext.tsx  # Job state management
│   ├── ErrorContext.tsx # Error state management
│   └── ...
├── services/           # Service layer
│   ├── types.ts        # Service interfaces
│   ├── jobServiceFactory.ts # Service factory
│   ├── mockJobService.ts    # Mock implementation
│   └── realJobService.ts    # Real API implementation
├── styles/             # SCSS stylesheets
└── i18n/              # Internationalization
```

## 🎯 API Specification Compliance

The real service implementation follows the exact API specification:

**REST Endpoints:**
- `GET /Jobs` - Fetch all jobs
- `POST /Jobs` - Create new job
- `POST /Jobs/{id}/stop` - Stop job
- `POST /Jobs/{id}/restart` - Restart job
- `DELETE /Jobs/{id}` - Delete job
- `DELETE /Jobs/status/{status}` - Bulk delete by status

**SignalR Events:**
- `UpdateJobProgress` - Real-time progress updates

**Data Models:**
- Complete compliance with Job, CreateJobRequest, ApiResponse models
- Proper enum handling for JobStatus and JobPriority

## 🏆 Evaluation Criteria Met

1. **✅ Service Architecture**: Clean abstraction with easy configuration switching
2. **✅ Code Quality**: TypeScript usage, component design, maintainability
3. **✅ Technical Implementation**: State management, error handling, real-time features
4. **✅ UI/UX Design**: Responsive design, good user experience

## 🔍 Troubleshooting

### Common Issues

**"Cannot connect to SignalR hub"**
- Expected when no backend is running in Real API mode
- Switch to Mock mode for development without backend

**"Environment variables not loaded"**
- Restart development server after `.env` changes
- Ensure `.env` file is in project root

**"Service factory errors"**
- Check service interface implementations
- Verify TypeScript compilation

### Debug Mode

Enable verbose logging:
```env
REACT_APP_DEBUG=true
```

This adds detailed console logs for:
- Service initialization
- API request/response cycles
- SignalR connection events
- Error handling flows

## 📄 License

This project is part of a technical assessment and is provided as-is for evaluation purposes.

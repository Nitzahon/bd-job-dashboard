# Job Dashboard - Architecture Documentation

## 🏗️ Project Structure Overview

```
src/
├── types/index.ts              # TypeScript definitions & interfaces
├── services/
│   ├── configService.ts        # Environment/configuration management
│   └── mockJobService.ts       # Mock API and SignalR simulation
├── utils/
│   └── mockDataGenerator.ts    # Generates realistic test data
├── components/                 # React UI components (to be built)
├── hooks/                      # Custom React hooks (to be built)
├── context/                    # React context providers (to be built)
└── i18n/                      # Internationalization setup (to be built)
```

---

## 📝 1. TypeScript Types (`src/types/index.ts`)

**Purpose:** Type safety foundation - defines all data structures from API specification

### Core Enums:
```typescript
export enum JobStatus {
  Pending = 0,    // Waiting to be queued
  InQueue = 1,    // Queued for processing  
  Running = 2,    // Currently executing
  Completed = 3,  // Finished successfully
  Failed = 4,     // Failed during execution
  Stopped = 5     // Manually stopped
}

export enum JobPriority {
  Regular = 0,    // Normal priority
  High = 1        // High priority
}
```

### Main Data Models:
- **`Job`** - Complete job object with all fields from API spec
- **`CreateJobRequest`** - Payload for creating new jobs (name + priority)
- **`ApiResponse`** - Standard API response format (isSuccess + message)
- **`JobProgressUpdate`** - SignalR real-time update format (jobID + status + progress)

### UI Helper Types:
- **`JobStatusCounts`** - For dashboard status cards (pending, inQueue, running, etc.)
- **`JobTableFilters`** - Search and filter state management
- **`JobTableSort`** - Column sorting configuration (field + direction)
- **`ModalState`** - Modal dialog management
- **`ServiceConfig`** - API configuration switching
- **`LocalizationConfig`** - i18n language and direction settings

---

## ⚙️ 2. Configuration Service (`src/services/configService.ts`)

**Purpose:** Centralized configuration management using Singleton pattern

### Key Functions:

#### `getServiceConfig(): ServiceConfig`
```typescript
{
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://localhost:5001',
  signalRHubUrl: process.env.REACT_APP_SIGNALR_HUB_URL || 'https://localhost:5001/JobSignalRHub',
  useMockData: process.env.REACT_APP_USE_MOCK_DATA !== 'false'
}
```
- **Reads environment variables** from `.env` file
- **Provides sensible defaults** if env vars missing
- **Controls mock vs real API** switching mechanism

#### `getDefaultLanguage()` & `getDefaultDirection()`
- **Language detection** with validation (en/he with fallback to 'en')
- **RTL/LTR direction** determination for internationalization
- **Type-safe validation** ensures only valid values

#### `isDevelopment()` & `isProduction()`
- **Environment detection** helpers for conditional logic
- **Useful for debugging** features and development-only functionality

**Design Pattern:** Singleton ensures single source of truth for configuration

---

## 🎲 3. Mock Data Generator (`src/utils/mockDataGenerator.ts`)

**Purpose:** Creates realistic job data for testing and development

### Core Functions:

#### `generateJob(overrides?: Partial<Job>): Job`
**Creates a single realistic job with intelligent defaults**

**Timestamp Logic:**
```typescript
const now = Date.now();
const createdAt = now - Math.random() * 86400000; // Random time in last 24 hours

// Business logic: jobs can only start after creation
if (status >= JobStatus.Running) {
  startedAt = createdAt + Math.random() * 3600000; // Started within 1 hour
  progress = status === JobStatus.Running ? Math.floor(Math.random() * 100) : 100;
}

// Completed/failed jobs must have completion time
if (status >= JobStatus.Completed) {
  completedAt = startedAt + Math.random() * 7200000; // Within 2 hours of start
}
```

**Status-Specific Logic:**
- **Failed jobs:** Progress 10-90%, includes realistic error message
- **Stopped jobs:** Progress 10-80%, no completion time (reset to 0)
- **Running jobs:** Random progress 0-99%
- **Completed jobs:** Always 100% progress

#### `generateJobs(count: number): Job[]`
**Creates a collection with realistic distribution**

**Fixed Issue:** Now handles small counts properly
```typescript
// For small counts (< 6), ensure at least one of each status
if (count < 6) {
  const statuses = [JobStatus.Pending, JobStatus.InQueue, ...];
  for (let i = 0; i < Math.min(count, statuses.length); i++) {
    jobs.push(this.generateJob({ status: statuses[i] }));
  }
} else {
  // For larger counts, use percentage distribution with Math.max(1, ...)
  const statusDistribution = [
    { status: JobStatus.Pending, count: Math.max(1, Math.floor(count * 0.1)) },
    // ... ensures at least 1 of each type
  ];
}
```

**Distribution Strategy:**
- **40% Running** - Most visible for demo purposes
- **20% Completed** - Shows successful completions
- **10% each** - Pending, InQueue, Failed, Stopped
- **Newest first** - Sorted by creation time

#### Private Helper Functions:
- **`getRandomJobName()`** - Combines realistic base names + random suffix
- **`getRandomStatus()`** - Uniform random selection from all statuses
- **`getRandomErrorMessage()`** - Realistic error scenarios

**Job Names Array:** 15 realistic job types covering common enterprise scenarios
**Error Messages:** 10 realistic failure scenarios (timeouts, permissions, etc.)

---

## 🔧 4. Mock Job Service (`src/services/mockJobService.ts`)

**Purpose:** Complete simulation of backend API and SignalR hub

### State Management:
```typescript
private jobs: Job[] = [];                           // In-memory job storage
private progressUpdateCallbacks: Function[] = [];   // SignalR subscribers  
private simulationIntervals: NodeJS.Timeout[] = []; // Background processes
```

### REST API Simulation:

#### `getJobs(): Promise<Job[]>`
- **Network delay simulation** (300-500ms random)
- **Returns immutable copy** prevents accidental mutation
- **Async/await pattern** matches real API exactly

#### `createJob(request: CreateJobRequest): Promise<Job>`
- **Input validation** and job creation
- **Status starts as Pending** following business rules
- **Auto-triggers progression** after 2-second delay
- **Adds to front** of array (newest first)

#### `stopJob(jobID: string): Promise<ApiResponse>`
```typescript
if (job.status !== JobStatus.Running && job.status !== JobStatus.InQueue) {
  return { isSuccess: false, message: 'Job cannot be stopped in current state' };
}
```
- **Business rule enforcement** - only Running/InQueue can be stopped
- **Status transition** to Stopped
- **SignalR notification** to update UI immediately
- **Proper error handling** with descriptive messages

#### `restartJob(jobID: string): Promise<ApiResponse>`
- **Validation:** Only Failed/Stopped jobs can restart
- **State reset:** Progress→0, error cleared, timestamps reset
- **Status transition** to Pending
- **Auto-progression trigger** after 3-second delay

#### `deleteJob()` & `deleteJobsByStatus()`
- **Individual deletion** by jobID
- **Bulk deletion** by status (for "Delete Jobs" feature)
- **Array manipulation** with proper cleanup

### SignalR Simulation:

#### `onProgressUpdate(callback): () => void`
```typescript
onProgressUpdate(callback: (update: JobProgressUpdate) => void): () => void {
  this.progressUpdateCallbacks.push(callback);
  
  return () => { // Unsubscribe function
    const index = this.progressUpdateCallbacks.indexOf(callback);
    if (index > -1) this.progressUpdateCallbacks.splice(index, 1);
  };
}
```
- **Observer pattern** - components subscribe to updates
- **Returns cleanup function** for component unmounting
- **Type-safe callbacks** with JobProgressUpdate interface

#### `notifyProgressUpdate(update: JobProgressUpdate)`
- **Broadcasts to all subscribers** simultaneously
- **Simulates real SignalR hub** behavior exactly
- **Immediate UI updates** for responsive feel

### Background Simulation:

#### `startProgressSimulation()`
**Creates two realistic background processes:**

**Progress Interval (every 2 seconds):**
```typescript
const runningJobs = this.jobs.filter(job => job.status === JobStatus.Running);
runningJobs.forEach(job => {
  if (job.progress < 100) {
    const increment = Math.random() * 5 + 1; // 1-6% progress per update
    job.progress = Math.min(100, job.progress + increment);
    
    this.notifyProgressUpdate({ jobID: job.jobID, status: job.status, progress: Math.floor(job.progress) });
    
    // Auto-complete at 100%
    if (job.progress >= 100) {
      const shouldFail = Math.random() < 0.1; // 10% failure rate
      job.status = shouldFail ? JobStatus.Failed : JobStatus.Completed;
      // ... handle completion logic
    }
  }
});
```

**Queue Management Interval (every 3 seconds):**
```typescript
// Move Pending → InQueue (30% chance per interval)
if (pendingJobs.length > 0 && Math.random() < 0.3) {
  const job = pendingJobs[0];
  job.status = JobStatus.InQueue;
  this.notifyProgressUpdate(...);
}

// Move InQueue → Running (40% chance per interval)  
if (inQueueJobs.length > 0 && Math.random() < 0.4) {
  const job = inQueueJobs[0];
  job.status = JobStatus.Running;
  job.startedAt = Date.now();
  this.notifyProgressUpdate(...);
}
```

#### `simulateJobProgression(jobID: string)`
**Individual job lifecycle automation:**
1. **Pending → InQueue** after 2-5 seconds
2. **InQueue → Running** after 3-7 additional seconds  
3. **Triggered automatically** for newly created jobs
4. **Realistic timing** simulates real job queue behavior

#### `destroy()`
**Cleanup method for memory management:**
- **Clears all intervals** prevents memory leaks
- **Removes all callbacks** prevents orphaned references
- **Essential for component unmounting** in React

---

## 🎯 Architecture Benefits

### Clean Separation of Concerns:
- **Types** define contracts
- **Config** manages environment
- **Generator** creates test data  
- **Service** simulates backend

### Easy Mock↔Real Switching:
- **Single environment variable** (`REACT_APP_USE_MOCK_DATA`)
- **Same interface** for mock and real services
- **No code changes** required in components

### Realistic Simulation:
- **Business rule enforcement** matches specification exactly
- **Real-time updates** via SignalR simulation
- **Network delays** and realistic timing
- **Proper error handling** and edge cases

### Type Safety:
- **Full TypeScript coverage** prevents runtime errors
- **Interface-driven development** ensures consistency
- **IDE autocomplete** and refactoring support

---

## 🔄 Data Flow

1. **Configuration Service** provides settings
2. **Components** call service methods
3. **Mock Service** simulates API calls with delays
4. **Background processes** update job statuses
5. **SignalR callbacks** notify UI of changes
6. **Components re-render** with updated data

This architecture provides a **fully functional backend simulation** that behaves exactly like the real API, enabling complete frontend development and testing without backend dependencies.

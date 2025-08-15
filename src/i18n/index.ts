import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { configService } from '../services/configService';

// Translation resources
const resources = {
  en: {
    translation: {
      // Dashboard Header
      "dashboard.title": "Job Dashboard",
      "dashboard.actions.createJob": "Create New Job",
      "dashboard.actions.deleteJobs": "Delete Jobs",
      
      // Status Cards
      "status.pending": "Pending",
      "status.inQueue": "In Queue", 
      "status.running": "Running",
      "status.completed": "Completed",
      "status.failed": "Failed",
      "status.stopped": "Stopped",
      "status.unknown": "Unknown",
      
      // Language Toggle
      "language.switchToHebrew": "Switch to Hebrew",
      "language.switchToEnglish": "Switch to English",
      
      // Job Table Headers
      "table.headers.jobName": "Job Name",
      "table.headers.priority": "Priority",
      "table.headers.status": "Status",
      "table.headers.progress": "Progress",
      "table.headers.createdAt": "Created At",
      "table.headers.startedAt": "Started At",
      "table.headers.completedAt": "Completed At",
      "table.headers.startTime": "Start Time",
      "table.headers.endTime": "End Time",
      "table.headers.actions": "Actions",
      
      // Table States
      "table.empty": "No jobs to display",
      
      // Job Priority
      "priority.regular": "Regular",
      "priority.high": "High",
      
      // Job Actions
      "actions.delete": "Delete",
      "actions.restart": "Restart",
      "actions.stop": "Stop",
      
      // Modals
      "modal.createJob.title": "Create New Job",
      "modal.createJob.jobName": "Job Name",
      "modal.createJob.jobNamePlaceholder": "Enter job name...",
      "modal.createJob.priority": "Priority",
      "modal.createJob.cancel": "Cancel",
      "modal.createJob.create": "Create",
      "modal.createJob.creating": "Creating...",
      
      "modal.deleteJobs.title": "Delete Jobs",
      "modal.deleteJobs.description": "Select a status to delete all jobs with that status. This action cannot be undone.",
      "modal.deleteJobs.selectStatus": "Select status to delete",
      "modal.deleteJobs.statusPlaceholder": "Choose a status...",
      "modal.deleteJobs.cancel": "Cancel",
      "modal.deleteJobs.delete": "Delete",
      "modal.deleteJobs.deleting": "Deleting...",
      
      "modal.confirmDelete.title": "Confirm Delete",
      "modal.confirmDelete.message": "Are you sure you want to delete this job?",
      "modal.confirmDelete.cancel": "Cancel",
      "modal.confirmDelete.delete": "Delete",
      
      // Search and Filters
      "search.placeholder": "Search jobs by name...",
      "search.clearTitle": "Clear search",
      "filters.clearAll": "Clear All Filters",
      "filters.showingResults": "Showing {{count}} of {{total}} jobs",
      
      // Empty States
      "empty.noJobs": "No jobs found",
      "empty.noJobsDescription": "Create your first job to get started",
      "empty.noResults": "No jobs match your search",
      "empty.noResultsDescription": "Try adjusting your search or filters",
      
      // Loading and Errors
      "loading.jobs": "Loading jobs...",
      "error.loadJobs": "Failed to load jobs",
      "error.createJob": "Failed to create job",
      "error.deleteJob": "Failed to delete job",
      "error.stopJob": "Failed to stop job",
      "error.restartJob": "Failed to restart job",
      
      // Validation
      "validation.nameRequired": "Job name is required",
      "validation.nameMinLength": "Job name must be at least 2 characters",
      "validation.statusRequired": "Please select a status to delete",
      
      // Error handling and connection
      "errors.api_error_title": "API Error",
      "errors.signalr_error_title": "Connection Error", 
      "errors.network_error_title": "Network Error",
      "errors.unknown_error_title": "Unknown Error",
      "errors.disconnected": "Disconnected from server",
      "errors.reconnecting": "Reconnecting to server...",
      "errors.signalr_default": "Lost connection to real-time updates",
      "errors.retry_attempt": "Retry attempt {{count}}",
      "errors.retry_button": "Retry",
      "errors.max_retries_reached": "Maximum retry attempts reached",
      "errors.connection_failed": "Failed to establish connection",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.retry": "Retry",
      "common.close": "Close"
    }
  },
  he: {
    translation: {

            "validation.nameRequired": "שם המשימה נדרש",
      "validation.nameMinLength": "שם המשימה חייב להיות לפחות 2 תווים",
      "validation.statusRequired": "אנא בחר מצב למחיקה",
      
      // Error handling and connection  
      "errors.api_error_title": "שגיאת API",
      "errors.signalr_error_title": "שגיאת חיבור",
      "errors.network_error_title": "שגיאת רשת",
      "errors.unknown_error_title": "שגיאה לא ידועה",
      "errors.disconnected": "מנותק מהשרת",
      "errors.reconnecting": "מתחבר מחדש לשרת...",
      "errors.signalr_default": "איבד חיבור לעדכונים בזמן אמת",
      "errors.retry_attempt": "ניסיון חיבור {{count}}",
      "errors.retry_button": "נסה שוב",
      "errors.max_retries_reached": "הגיע למספר הניסיונות המקסימלי",
      "errors.connection_failed": "נכשל בהקמת חיבור",
      
      // Common
      "common.loading": "טוען...",
      "common.error": "שגיאה",
      "common.retry": "נסה שוב",
      "common.close": "סגור",

      // Dashboard Header
      "dashboard.title": "לוח בקרת משימות",
      "dashboard.actions.createJob": "צור משימה חדשה",
      "dashboard.actions.deleteJobs": "מחק משימות",
      
      // Status Cards
      "status.pending": "בהמתנה",
      "status.inQueue": "בתור",
      "status.running": "פועל",
      "status.completed": "הושלם",
      "status.failed": "נכשל",
      "status.stopped": "נעצר",
      "status.unknown": "לא ידוע",
      
      // Language Toggle
      "language.switchToHebrew": "עבור לעברית",
      "language.switchToEnglish": "עבור לאנגלית",
      
      // Job Table Headers
      "table.headers.jobName": "שם המשימה",
      "table.headers.priority": "עדיפות",
      "table.headers.status": "מצב",
      "table.headers.progress": "התקדמות",
      "table.headers.createdAt": "נוצר ב",
      "table.headers.startedAt": "התחיל ב",
      "table.headers.completedAt": "הושלם ב",
      "table.headers.startTime": "זמן התחלה",
      "table.headers.endTime": "זמן סיום",
      "table.headers.actions": "פעולות",
      
      // Table States
      "table.empty": "אין משימות להצגה",
      
      // Job Priority
      "priority.regular": "רגיל",
      "priority.high": "גבוה",
      
      // Job Actions
      "actions.delete": "מחק",
      "actions.restart": "הפעל מחדש",
      "actions.stop": "עצור",
      
      // Modals
      "modal.createJob.title": "צור משימה חדשה",
      "modal.createJob.jobName": "שם המשימה",
      "modal.createJob.jobNamePlaceholder": "הכנס שם משימה...",
      "modal.createJob.priority": "עדיפות",
      "modal.createJob.cancel": "ביטול",
      "modal.createJob.create": "צור",
      "modal.createJob.creating": "יוצר...",
      
      "modal.deleteJobs.title": "מחק משימות",
      "modal.deleteJobs.description": "בחר מצב כדי למחוק את כל המשימות עם המצב הזה. פעולה זו לא ניתנת לביטול.",
      "modal.deleteJobs.selectStatus": "בחר מצב למחיקה",
      "modal.deleteJobs.statusPlaceholder": "בחר מצב...",
      "modal.deleteJobs.cancel": "ביטול",
      "modal.deleteJobs.delete": "מחק",
      "modal.deleteJobs.deleting": "מוחק...",
      
      "modal.confirmDelete.title": "אשר מחיקה",
      "modal.confirmDelete.message": "האם אתה בטוח שברצונך למחוק משימה זו?",
      "modal.confirmDelete.cancel": "ביטול",
      "modal.confirmDelete.delete": "מחק",
      
      // Search and Filters
      "search.placeholder": "חפש משימות לפי שם...",
      "search.clearTitle": "נקה חיפוש",
      "filters.clearAll": "נקה כל המסננים",
      "filters.showingResults": "מציג {{count}} מתוך {{total}} משימות",
      
      // Empty States
      "empty.noJobs": "לא נמצאו משימות",
      "empty.noJobsDescription": "צור את המשימה הראשונה שלך כדי להתחיל",
      "empty.noResults": "אין משימות התואמות לחיפוש",
      "empty.noResultsDescription": "נסה לשנות את החיפוש או המסננים",
      
      // Loading and Errors
      "loading.jobs": "טוען משימות...",
      "error.loadJobs": "שגיאה בטעינת משימות",
      "error.createJob": "שגיאה ביצירת משימה",
      "error.deleteJob": "שגיאה במחיקת משימה",
      "error.stopJob": "שגיאה בעצירת משימה",
      "error.restartJob": "שגיאה בהפעלת משימה מחדש",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: configService.getDefaultLanguage(),
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;

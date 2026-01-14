// Firebase configuration exports
export { auth, db, initAnalytics } from './config';

// Firestore service exports
export {
  // Organization functions (Owner only)
  createOrganizationWithAdmin,
  getAllOrganizations,
  // Class code functions (Admin only)
  createClassCode,
  getClassCodesByOrganization,
  toggleClassCodeActive,
  validateClassCode,
  // Student functions
  getStudentsByClassCode,
  getStudentCountByCode,
  // User functions
  createUserProfile,
  getUserProfile,
  // Student progress functions
  initializeStudentProgress,
  getStudentProgress,
  updateModuleScore,
  updateStreak,
  addAchievement,
  // Optimized data fetching
  getUserDashboardData,
  getStudentsWithProgress,
  getAllStudentsWithProgressByOrganization,
  resetModuleProgress,
} from './firestore.service';

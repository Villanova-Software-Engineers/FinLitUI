/**
 * Bug Report Service
 * Handles bug report submission to Firestore and image uploads to Firebase Storage
 */

import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import type { User } from '../auth/types/auth.types';

export interface BugReport {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  deviceInfo: string;
  browserInfo: string;
}

export interface BugReportSubmission extends BugReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  imageUrls: string[];
  status: 'new' | 'in-progress' | 'resolved' | 'wont-fix';
  submittedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  adminNotes?: string;
}

/**
 * Submit one or more bug reports with optional images
 */
export async function submitBugReport(
  reports: BugReport[],
  images: File[],
  user: User
): Promise<void> {
  try {
    // Upload images first
    const imageUrls: string[] = [];

    if (images.length > 0) {
      for (const image of images) {
        const timestamp = Date.now();
        const fileName = `bug-reports/${user.id}/${timestamp}_${image.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }
    }

    // Submit each bug report
    for (const report of reports) {
      const bugReportData = {
        ...report,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        userRole: user.role,
        imageUrls,
        status: 'new',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bugReports'), bugReportData);
    }
  } catch (error) {
    console.error('Error submitting bug report:', error);
    throw new Error('Failed to submit bug report. Please try again.');
  }
}

/**
 * Get all bug reports (Admin only)
 */
export async function getAllBugReports(): Promise<BugReportSubmission[]> {
  try {
    const q = query(
      collection(db, 'bugReports'),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        resolvedAt: data.resolvedAt?.toDate(),
      } as BugReportSubmission;
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    throw new Error('Failed to fetch bug reports');
  }
}

/**
 * Get bug reports by user
 */
export async function getBugReportsByUser(userId: string): Promise<BugReportSubmission[]> {
  try {
    const q = query(
      collection(db, 'bugReports'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        resolvedAt: data.resolvedAt?.toDate(),
      } as BugReportSubmission;
    });
  } catch (error) {
    console.error('Error fetching user bug reports:', error);
    throw new Error('Failed to fetch bug reports');
  }
}

/**
 * Update bug report status (Admin only)
 */
export async function updateBugReportStatus(
  reportId: string,
  status: BugReportSubmission['status'],
  adminNotes?: string,
  adminId?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'resolved' && adminId) {
      updateData.resolvedAt = serverTimestamp();
      updateData.resolvedBy = adminId;
    }

    await updateDoc(doc(db, 'bugReports', reportId), updateData);
  } catch (error) {
    console.error('Error updating bug report:', error);
    throw new Error('Failed to update bug report');
  }
}

/**
 * Get bug report statistics
 */
export async function getBugReportStats(): Promise<{
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  wontFix: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  try {
    const snapshot = await getDocs(collection(db, 'bugReports'));

    const stats = {
      total: snapshot.size,
      new: 0,
      inProgress: 0,
      resolved: 0,
      wontFix: 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byCategory: { ui: 0, functionality: 0, performance: 0, security: 0, other: 0 },
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();

      // Count by status
      if (data.status === 'new') stats.new++;
      else if (data.status === 'in-progress') stats.inProgress++;
      else if (data.status === 'resolved') stats.resolved++;
      else if (data.status === 'wont-fix') stats.wontFix++;

      // Count by severity
      const severity = data.severity as keyof typeof stats.bySeverity;
      if (severity in stats.bySeverity) {
        stats.bySeverity[severity]++;
      }

      // Count by category
      const category = data.category as keyof typeof stats.byCategory;
      if (category in stats.byCategory) {
        stats.byCategory[category]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching bug report stats:', error);
    throw new Error('Failed to fetch statistics');
  }
}

/**
 * Seed script to create initial organization in Firestore
 * Run this once to set up your first organization
 *
 * Usage: Import and call seedInitialData() from your app or browser console
 */

import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Generate random alphanumeric code
function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function seedInitialData() {
  try {
    // Create the organization with a random 8-character code
    const orgCode = generateCode(8);
    const orgRef = doc(collection(db, 'organizations'));

    await setDoc(orgRef, {
      name: 'FinLit Academy',
      code: orgCode,
      createdBy: 'system',
      createdAt: serverTimestamp(),
    });

    console.log('✅ Organization created successfully!');
    console.log('Organization ID:', orgRef.id);
    console.log('Organization Code (for instructors):', orgCode);

    return {
      organization: {
        id: orgRef.id,
        code: orgCode,
        name: 'FinLit Academy',
      },
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

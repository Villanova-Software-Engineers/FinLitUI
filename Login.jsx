import { auth } from './firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // We can add email verification check here if needed
    if (!user.emailVerified) {
        await auth.signOut();
    }
    return user;
    // return user;
  } catch (error) {
    alert("login error: " + error.message);
    throw error;
  }
}
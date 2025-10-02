import { auth, db} from './firebase-config';
//import emailVerifcation from "firebase/auth";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function signup(email, password, profileData) {

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await sendEmailVerification(user);

        await saveUserProfile(user.uid, profileData, email);

        await signOut(auth);

        // Optionally, send email verification
        // await sendEmailVerification(user);

        return user;
    } catch (error) {
        alert("signup error: " + error.message);
        throw error;
    }
}


async function checkUsernameExists(username) {
    try {
        const usernameDoc = doc(db, 'usernames', username.toLowerCase());
        const docSnapshot = await getDoc(usernameDoc);
        return docSnapshot.exists();
    } catch (error) {
        alert("checkUsernameExists error: " + error.message);
        throw new Error("failed to verify username availability. Please try again.");
    }
}


async function saveUserProfile(userID, profileData, email) {
    try {
        const userDocRef = doc(db, 'users', userID);
        await setDoc(userDocRef, {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            username: profileData.username.toLowerCase(),
            // school: profileData.school,
            email: email.toLowerCase(),
            createdAt: new Date()
        });

        const usernameDocRef = doc(db, 'usernames', profileData.username.toLowerCase().trim());
        await setDoc(usernameDocRef, { uid: userID });
        alert("User profile saved successfully.");

    } catch (error) {
        alert("saveUserProfile error: " + error.message);
        throw new Error("failed to save user profile. Please try again.");
    }
}
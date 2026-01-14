rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role from users collection
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to get user's organization
    function getUserOrgId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
    }
    
    // Organizations collection
    match /organizations/{orgId} {
      // Anyone authenticated can read (for code validation)
      allow read: if isAuthenticated();
      // Only owner can create organizations
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && getUserRole() == 'owner';
    }
    
    // Class codes collection
    match /classCodes/{codeId} {
      // Anyone authenticated can read (for validation during signup)
      allow read: if isAuthenticated();
      // Admins can create codes for their organization
      allow create: if isAuthenticated() && getUserRole() == 'admin';
      // Admins can update/delete their own org's codes
      allow update, delete: if isAuthenticated() && 
        getUserRole() == 'admin' && 
        resource.data.organizationId == getUserOrgId();
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;
      // Admins can read students in their organization
      allow read: if isAuthenticated() && 
        getUserRole() == 'admin' && 
        resource.data.organizationId == getUserOrgId();
      // Allow creating user profiles
      allow create: if isAuthenticated();
      // Users can update their own profile
      allow update: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Student progress collection
    match /studentProgress/{progressId} {
      // Students can read/write their own progress
      allow read, write: if isAuthenticated() && request.auth.uid == progressId;
      // Admins can read progress for their org's students
      allow read: if isAuthenticated() && 
        getUserRole() == 'admin' && 
        resource.data.organizationId == getUserOrgId();
    }
  }
}

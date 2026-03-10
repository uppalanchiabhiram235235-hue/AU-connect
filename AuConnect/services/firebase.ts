/**
 * Firebase removal: This file now acts as a stub to prevent import errors.
 * The application has been transitioned to use local storage via services/api.ts.
 */

export const firebaseConfig = {};

// Always true to allow the app to bypass the connection guard
export const isFirebaseConfigured = true;

// Mock exports to satisfy imports in other files
export const auth = {} as any;
export const db = {} as any;
export const app = {} as any;
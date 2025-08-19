/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { state } from './state';
import type { User } from './types';
import { Logger } from './logger';
import { showToast } from './ui';

/**
 * Initiates the login process by redirecting the user to the backend's login endpoint.
 */
export function login() {
    Logger.log("Redirecting to server for Microsoft login.");
    window.location.assign('/api/auth/login');
}

/**
 * Initiates the logout process by redirecting the user to the backend's logout endpoint.
 */
export function logout() {
    Logger.log("Redirecting to server for logout.");
    state.currentUser = null;
    window.location.assign('/api/auth/logout');
}

/**
 * Checks if a user session exists by calling a secure backend endpoint.
 * @returns {Promise<User | null>} The user object if logged in, otherwise null.
 */
export async function checkSession(): Promise<User | null> {
    try {
        const response = await fetch('/api/user/profile');

        if (response.status === 401) {
            Logger.log("No active session found (401).");
            return null;
        }

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const user: User = await response.json();
        return user;
    } catch (error) {
        Logger.error("Failed to check user session:", error);
        showToast("Could not verify login status. Please check your connection.", "error");
        return null;
    }
}

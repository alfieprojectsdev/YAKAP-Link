/**
 * Application Configuration
 *
 * Centralized configuration management for the application.
 * Settings are loaded from environment variables (Vite) with fallback defaults.
 */

export const config = {
    /**
     * The municipality where this instance is deployed.
     * Used for "Home Court" validation in Protocol-20k.
     */
    municipality: import.meta.env.VITE_MUNICIPALITY || 'Tabuk',

    /**
     * Simulation flag for network connectivity.
     * In a real application, this would be replaced by a hook (e.g., useNetworkStatus).
     * Defaults to false (Offline) to simulate the critical path of the application.
     */
    isOnline: import.meta.env.VITE_IS_ONLINE === 'true'
};

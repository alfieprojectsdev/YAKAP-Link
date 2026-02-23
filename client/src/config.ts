import { type LocalSettings } from './utils/dispensingGuard';

export const LOCAL_SETTINGS: LocalSettings = {
    municipality: import.meta.env.VITE_MUNICIPALITY || 'Tabuk',
    isOnline: import.meta.env.VITE_IS_ONLINE === 'true' // Default to false if not set
};

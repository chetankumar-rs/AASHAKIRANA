import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineStorage } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';

const OfflineContext = createContext({});

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically sync when coming online
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending sync count
    loadPendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingSyncCount = async () => {
    try {
      const pendingForms = await offlineStorage.getPendingSync();
      setPendingSyncCount(pendingForms.length);
    } catch (error) {
      console.error('Error loading pending sync count:', error);
    }
  };

  const saveFormOffline = async (formType, formData) => {
    try {
      await offlineStorage.saveForm(formType, formData);
      await loadPendingSyncCount();
      return { success: true };
    } catch (error) {
      console.error('Error saving form offline:', error);
      return { success: false, error: error.message };
    }
  };

  const syncPendingData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncManager.syncToServer();
      if (result.success) {
        await loadPendingSyncCount();
      }
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isOnline,
    pendingSyncCount,
    isSyncing,
    saveFormOffline,
    syncPendingData,
    loadPendingSyncCount,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};
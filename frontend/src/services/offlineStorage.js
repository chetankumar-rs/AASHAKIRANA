import Dexie from 'dexie';

// IndexedDB database using Dexie
class OfflineDatabase extends Dexie {
  constructor() {
    super('AASHAKIRANAOfflineDB');
    
    this.version(1).stores({
      forms: '++id, formType, data, timestamp, synced',
      alerts: '++id, title, message, type, timestamp, read',
      dashboard: '++id, data, timestamp',
    });
  }
}

const db = new OfflineDatabase();

export const offlineStorage = {
  // Save form data offline
  async saveForm(formType, formData) {
    try {
      const id = await db.forms.add({
        formType,
        data: formData,
        timestamp: new Date(),
        synced: false,
      });
      console.log(`Saved ${formType} form offline with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error saving form offline:', error);
      throw error;
    }
  },

  // Get all pending forms to sync
  async getPendingSync() {
    try {
      return await db.forms.where('synced').equals(false).toArray();
    } catch (error) {
      console.error('Error getting pending sync forms:', error);
      return [];
    }
  },

  // Mark forms as synced
  async markFormsSynced(formIds) {
    try {
      await db.forms.where('id').anyOf(formIds).modify({ synced: true });
      console.log(`Marked ${formIds.length} forms as synced`);
    } catch (error) {
      console.error('Error marking forms as synced:', error);
    }
  },

  // Save alerts offline
  async saveAlert(alertData) {
    try {
      const id = await db.alerts.add({
        ...alertData,
        timestamp: new Date(),
        read: false,
      });
      return id;
    } catch (error) {
      console.error('Error saving alert offline:', error);
      throw error;
    }
  },

  // Get offline alerts
  async getOfflineAlerts() {
    try {
      return await db.alerts.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Error getting offline alerts:', error);
      return [];
    }
  },

  // Mark alert as read
  async markAlertRead(alertId) {
    try {
      await db.alerts.update(alertId, { read: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  },

  // Save dashboard data for offline viewing
  async saveDashboardData(dashboardData) {
    try {
      // Keep only the latest dashboard data
      await db.dashboard.clear();
      const id = await db.dashboard.add({
        data: dashboardData,
        timestamp: new Date(),
      });
      return id;
    } catch (error) {
      console.error('Error saving dashboard data offline:', error);
    }
  },

  // Get offline dashboard data
  async getOfflineDashboardData() {
    try {
      const latestData = await db.dashboard.orderBy('timestamp').reverse().first();
      return latestData?.data || null;
    } catch (error) {
      console.error('Error getting offline dashboard data:', error);
      return null;
    }
  },

  // Clear all offline data
  async clearAllData() {
    try {
      await db.forms.clear();
      await db.alerts.clear();
      await db.dashboard.clear();
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  },

  // Get forms by type
  async getFormsByType(formType) {
    try {
      return await db.forms.where('formType').equals(formType).toArray();
    } catch (error) {
      console.error(`Error getting ${formType} forms:`, error);
      return [];
    }
  },
};

export default offlineStorage;
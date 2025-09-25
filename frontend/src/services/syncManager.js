import { formsAPI } from './api';
import { offlineStorage } from './offlineStorage';

export const syncManager = {
  async syncToServer() {
    try {
      const pendingForms = await offlineStorage.getPendingSync();
      
      if (pendingForms.length === 0) {
        return { success: true, message: 'No pending forms to sync' };
      }

      // Group forms by type
      const groupedForms = {};
      const formIds = [];

      pendingForms.forEach(form => {
        if (!groupedForms[form.formType]) {
          groupedForms[form.formType] = [];
        }
        groupedForms[form.formType].push(form.data);
        formIds.push(form.id);
      });

      // Sync each form type
      let syncedCount = 0;
      const errors = [];

      for (const [formType, forms] of Object.entries(groupedForms)) {
        try {
          for (const formData of forms) {
            await this.syncSingleForm(formType, formData);
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing ${formType}:`, error);
          errors.push(`${formType}: ${error.message}`);
        }
      }

      // Mark successfully synced forms
      if (syncedCount > 0) {
        const syncedFormIds = formIds.slice(0, syncedCount);
        await offlineStorage.markFormsSynced(syncedFormIds);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Synced ${syncedCount} forms with errors: ${errors.join(', ')}`
        };
      }

      return {
        success: true,
        message: `Successfully synced ${syncedCount} forms`
      };

    } catch (error) {
      console.error('Sync manager error:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  },

  async syncSingleForm(formType, formData) {
    switch (formType) {
      case 'family_survey':
        return await formsAPI.createFamilySurvey(formData);
      
      case 'pregnancy_report':
        return await formsAPI.createPregnancyReport(formData);
      
      case 'child_vaccination':
        return await formsAPI.createChildVaccination(formData);
      
      case 'postnatal_care':
        return await formsAPI.createPostnatalCare(formData);
      
      case 'leprosy_report':
        return await formsAPI.createLeprosyReport(formData);
      
      default:
        throw new Error(`Unknown form type: ${formType}`);
    }
  },

  async handleConflictResolution(localData, serverData) {
    // Simple conflict resolution: show modal to user
    return new Promise((resolve) => {
      // For now, prefer local data
      // In a real app, you'd show a modal for user to choose
      resolve(localData);
    });
  }
};

export default syncManager;
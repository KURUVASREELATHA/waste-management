// Data recovery utility for restoring lost dashboard data
import { api } from './api';
import { dataSync } from './dataSync';

export class DataRecoveryService {
  private static instance: DataRecoveryService;

  private constructor() {}

  static getInstance(): DataRecoveryService {
    if (!DataRecoveryService.instance) {
      DataRecoveryService.instance = new DataRecoveryService();
    }
    return DataRecoveryService.instance;
  }

  // Recover citizen dashboard data
  async recoverCitizenData() {
    console.log('🔄 Starting citizen data recovery...');
    
    try {
      // Force fresh fetch from server
      const [wasteHistory, reports, stats, purchases] = await Promise.all([
        api.get('/waste/history'),
        api.get('/reports/my-reports'),
        api.get('/waste/stats'),
        api.get('/products/purchases/my').catch(() => [])
      ]);

      // Store recovered data
      const recoveredData = {
        wasteHistory: wasteHistory || [],
        myReports: reports || [],
        wasteStats: stats || { todayWaste: 0, totalWaste: 0, thisMonth: 0, recycledPercent: 0 },
        purchaseHistory: purchases || [],
        recoveredAt: new Date().toISOString()
      };

      // Cache the recovered data
      dataSync.cacheData('wasteHistory', recoveredData.wasteHistory);
      dataSync.cacheData('myReports', recoveredData.myReports);
      dataSync.cacheData('wasteStats', recoveredData.wasteStats);
      dataSync.cacheData('purchaseHistory', recoveredData.purchaseHistory);

      // Also store in localStorage as backup
      localStorage.setItem('wasteHistory', JSON.stringify(recoveredData.wasteHistory));
      localStorage.setItem('myReports', JSON.stringify(recoveredData.myReports));
      localStorage.setItem('wasteStats', JSON.stringify(recoveredData.wasteStats));
      localStorage.setItem('purchaseHistory', JSON.stringify(recoveredData.purchaseHistory));
      localStorage.setItem('lastDataRecovery', recoveredData.recoveredAt);

      console.log('✅ Citizen data recovery completed:', {
        wasteItems: recoveredData.wasteHistory.length,
        reports: recoveredData.myReports.length,
        purchases: recoveredData.purchaseHistory.length
      });

      return recoveredData;
    } catch (error) {
      console.error('❌ Citizen data recovery failed:', error);
      throw error;
    }
  }

  // Recover worker dashboard data
  async recoverWorkerData() {
    console.log('🔄 Starting worker data recovery...');
    
    try {
      // Force fresh fetch from server
      const [reports, allWaste, recyclingCenters] = await Promise.all([
        api.get('/reports/all'),
        api.get('/waste/all'),
        fetch('http://localhost:3001/api/recycling-centers').then(res => res.json()).catch(() => [])
      ]);

      const pendingWaste = allWaste.filter((w: any) => w.status === 'pending');
      const collectedWaste = allWaste.filter((w: any) => w.status === 'collected')
        .sort((a: any, b: any) => new Date(b.collectedAt || b.updatedAt).getTime() - new Date(a.collectedAt || a.updatedAt).getTime());

      const recoveredData = {
        reports: reports || [],
        allWaste: allWaste || [],
        pendingWaste,
        collectedWaste,
        recyclingCenters: recyclingCenters || [],
        recoveredAt: new Date().toISOString()
      };

      // Cache the recovered data
      dataSync.cacheData('workerReports', recoveredData.reports);
      dataSync.cacheData('workerWaste', recoveredData.allWaste);
      dataSync.cacheData('pendingWaste', recoveredData.pendingWaste);
      dataSync.cacheData('collectedWaste', recoveredData.collectedWaste);
      dataSync.cacheData('recyclingCenters', recoveredData.recyclingCenters);

      console.log('✅ Worker data recovery completed:', {
        reports: recoveredData.reports.length,
        pendingWaste: recoveredData.pendingWaste.length,
        collectedWaste: recoveredData.collectedWaste.length,
        recyclingCenters: recoveredData.recyclingCenters.length
      });

      return recoveredData;
    } catch (error) {
      console.error('❌ Worker data recovery failed:', error);
      throw error;
    }
  }

  // Check if data recovery is needed
  needsRecovery(userType: 'citizen' | 'worker'): boolean {
    const lastRecovery = localStorage.getItem('lastDataRecovery');
    if (!lastRecovery) return true;

    const recoveryTime = new Date(lastRecovery);
    const now = new Date();
    const hoursSinceRecovery = (now.getTime() - recoveryTime.getTime()) / (1000 * 60 * 60);

    // Suggest recovery if it's been more than 6 hours
    if (hoursSinceRecovery > 6) return true;

    // Check if essential data is missing
    if (userType === 'citizen') {
      const wasteHistory = localStorage.getItem('wasteHistory');
      const reports = localStorage.getItem('myReports');
      return !wasteHistory || !reports;
    } else {
      const pendingWaste = dataSync.getCachedData('pendingWaste');
      const collectedWaste = dataSync.getCachedData('collectedWaste');
      return !pendingWaste || !collectedWaste;
    }
  }

  // Auto-recovery with retry logic
  async autoRecover(userType: 'citizen' | 'worker', maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Auto-recovery attempt ${attempt}/${maxRetries} for ${userType}`);
        
        if (userType === 'citizen') {
          return await this.recoverCitizenData();
        } else {
          return await this.recoverWorkerData();
        }
      } catch (error) {
        console.error(`❌ Auto-recovery attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Data recovery failed after ${maxRetries} attempts`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Clear all cached data (for troubleshooting)
  clearAllCache() {
    console.log('🗑️ Clearing all cached data...');
    
    // Clear dataSync cache
    dataSync.clearCache();
    
    // Clear localStorage items
    const keysToRemove = [
      'wasteHistory', 'myReports', 'wasteStats', 'purchaseHistory',
      'workerLastUpdate', 'lastDataRecovery', 'lastUpdate'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ All cached data cleared');
  }

  // Export data for backup
  exportData() {
    const allData = {
      wasteHistory: JSON.parse(localStorage.getItem('wasteHistory') || '[]'),
      myReports: JSON.parse(localStorage.getItem('myReports') || '[]'),
      wasteStats: JSON.parse(localStorage.getItem('wasteStats') || '{}'),
      purchaseHistory: JSON.parse(localStorage.getItem('purchaseHistory') || '[]'),
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waste-wise-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('📁 Data exported successfully');
  }
}

export const dataRecovery = DataRecoveryService.getInstance();
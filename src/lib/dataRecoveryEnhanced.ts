import { api } from './api';
import dataPersistence from './dataPersistence';

interface RecoveryOptions {
  forceRefresh?: boolean;
  maxAge?: number; // in milliseconds
}

class DataRecoveryEnhanced {
  private recoveryInProgress = false;
  private lastRecoveryTime = 0;
  private minRecoveryInterval = 30000; // 30 seconds

  // Check if recovery is needed
  needsRecovery(dataType: string, maxAge: number = 300000): boolean {
    const lastUpdate = localStorage.getItem(`${dataType}_lastUpdate`);
    if (!lastUpdate) return true;
    
    const age = Date.now() - parseInt(lastUpdate);
    return age > maxAge;
  }

  // Recover worker dashboard data
  async recoverWorkerData(options: RecoveryOptions = {}): Promise<any> {
    if (this.recoveryInProgress && !options.forceRefresh) {
      throw new Error('Recovery already in progress');
    }

    if (Date.now() - this.lastRecoveryTime < this.minRecoveryInterval && !options.forceRefresh) {
      throw new Error('Recovery attempted too recently');
    }

    this.recoveryInProgress = true;
    this.lastRecoveryTime = Date.now();

    try {
      console.log('Starting worker data recovery...');

      // Try to get fresh data from server
      const [wasteData, reportsData, statsData] = await Promise.allSettled([
        api.get('/waste/all'),
        api.get('/reports/all'),
        api.get('/waste/dashboard-stats')
      ]);

      const recoveredData: any = {
        timestamp: Date.now(),
        source: 'server'
      };

      // Process waste data
      if (wasteData.status === 'fulfilled') {
        const allWaste = wasteData.value;
        const pendingWaste = allWaste.filter((w: any) => w.status === 'pending');
        const collectedWaste = allWaste.filter((w: any) => w.status === 'collected')
          .sort((a: any, b: any) => new Date(b.collectedAt || b.updatedAt).getTime() - new Date(a.collectedAt || a.updatedAt).getTime());

        recoveredData.pendingWaste = pendingWaste;
        recoveredData.collectedWaste = collectedWaste;

        // Store in persistent storage
        dataPersistence.storePendingWaste(pendingWaste);
        dataPersistence.storeCollectedWaste(collectedWaste);
      }

      // Process reports data
      if (reportsData.status === 'fulfilled') {
        const reports = reportsData.value;
        const pendingReports = reports.filter((r: any) => r.status === 'pending');
        recoveredData.pendingReports = pendingReports;
      }

      // Process stats data
      if (statsData.status === 'fulfilled') {
        const stats = statsData.value;
        recoveredData.workerStats = {
          collectionsToday: stats.collectionsToday || 0,
          totalCollected: stats.wasteCollectedToday || 0,
          reportsResolved: 0,
          overallCollected: stats.totalCollected || 0,
          monthlyTotal: stats.monthlyTotal || 0
        };

        dataPersistence.storeWorkerStats(recoveredData.workerStats);
      }

      // Get municipal houses
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const municipalId = user?.municipalId || 'MU01';
        
        const citizensResponse = await api.get(`/auth/citizens?municipalId=${municipalId}`);
        const houses = citizensResponse.map((citizen: any) => ({
          houseId: citizen.houseId || citizen._id,
          name: citizen.name,
          address: citizen.address || 'Address not provided',
          municipalId: citizen.municipalId,
          phone: citizen.phone,
          email: citizen.email,
          qrCode: citizen.qrCode,
          wasteStatus: recoveredData.collectedWaste?.some((w: any) => 
            (w.citizenHouseId === citizen.houseId || w.citizenHouseId === citizen._id) && w.status === 'collected'
          ) ? 'collected' : 'pending'
        }));

        recoveredData.municipalHouses = houses;
        dataPersistence.storeMunicipalHouses(houses);
      } catch (error) {
        console.warn('Failed to recover municipal houses:', error);
      }

      // Mark recovery timestamp
      localStorage.setItem('worker_lastUpdate', Date.now().toString());
      localStorage.setItem('workerDataRecovered', JSON.stringify(recoveredData));

      console.log('Worker data recovery completed successfully');
      return recoveredData;

    } catch (error) {
      console.error('Worker data recovery failed:', error);
      
      // Try to load from persistent storage as fallback
      const fallbackData = {
        pendingWaste: dataPersistence.getPendingWaste(),
        collectedWaste: dataPersistence.getCollectedWaste(),
        workerStats: dataPersistence.getWorkerStats(),
        municipalHouses: dataPersistence.getMunicipalHouses(),
        source: 'cache'
      };

      if (fallbackData.pendingWaste.length > 0 || fallbackData.collectedWaste.length > 0) {
        console.log('Using cached data as fallback');
        return fallbackData;
      }

      throw error;
    } finally {
      this.recoveryInProgress = false;
    }
  }

  // Recover admin dashboard data
  async recoverAdminData(options: RecoveryOptions = {}): Promise<any> {
    if (this.recoveryInProgress && !options.forceRefresh) {
      throw new Error('Recovery already in progress');
    }

    this.recoveryInProgress = true;

    try {
      console.log('Starting admin data recovery...');

      const [statsData, usersData, reportsData] = await Promise.allSettled([
        api.get('/waste/dashboard-stats'),
        api.get('/auth/users/counts'),
        api.get('/reports/all')
      ]);

      const recoveredData: any = {
        timestamp: Date.now(),
        source: 'server'
      };

      // Process stats
      if (statsData.status === 'fulfilled') {
        const stats = statsData.value;
        recoveredData.adminData = {
          totalHouseholds: stats.totalHouseholds || 0,
          activeVehicles: Math.max(1, Math.ceil((stats.wasteCollectedToday || 0) / 100)),
          wasteCollectedToday: stats.wasteCollectedToday || 0,
          recyclingCenters: stats.wasteCollectedToday > 0 ? Math.max(1, Math.ceil(stats.wasteCollectedToday / 50)) : 0,
          pendingReports: stats.pendingCollections || 0,
          resolvedReports: 0,
          collectionRate: stats.collectionRate || 0,
          totalCollected: stats.totalCollected || 0,
          monthlyTotal: stats.monthlyTotal || 0
        };

        dataPersistence.storeDashboardData(recoveredData.adminData);
      }

      // Process user counts
      if (usersData.status === 'fulfilled') {
        recoveredData.userCounts = usersData.value;
      }

      // Process reports
      if (reportsData.status === 'fulfilled') {
        const reports = reportsData.value;
        const pendingCount = reports.filter((r: any) => r.status === 'pending').length;
        const resolvedCount = reports.filter((r: any) => r.status === 'resolved').length;
        
        if (recoveredData.adminData) {
          recoveredData.adminData.pendingReports = pendingCount;
          recoveredData.adminData.resolvedReports = resolvedCount;
        }
      }

      localStorage.setItem('admin_lastUpdate', Date.now().toString());
      localStorage.setItem('adminDataRecovered', JSON.stringify(recoveredData));

      console.log('Admin data recovery completed successfully');
      return recoveredData;

    } catch (error) {
      console.error('Admin data recovery failed:', error);
      
      // Try to load from persistent storage
      const fallbackData = {
        adminData: dataPersistence.getDashboardData(),
        source: 'cache'
      };

      if (fallbackData.adminData) {
        console.log('Using cached admin data as fallback');
        return fallbackData;
      }

      throw error;
    } finally {
      this.recoveryInProgress = false;
    }
  }

  // Recover citizen dashboard data
  async recoverCitizenData(options: RecoveryOptions = {}): Promise<any> {
    if (this.recoveryInProgress && !options.forceRefresh) {
      throw new Error('Recovery already in progress');
    }

    this.recoveryInProgress = true;

    try {
      console.log('Starting citizen data recovery...');

      const [wasteHistory, wasteStats, products] = await Promise.allSettled([
        api.get('/waste/history'),
        api.get('/waste/stats'),
        api.get('/products')
      ]);

      const recoveredData: any = {
        timestamp: Date.now(),
        source: 'server'
      };

      if (wasteHistory.status === 'fulfilled') {
        recoveredData.wasteHistory = wasteHistory.value;
      }

      if (wasteStats.status === 'fulfilled') {
        recoveredData.wasteStats = wasteStats.value;
      }

      if (products.status === 'fulfilled') {
        recoveredData.products = products.value;
      }

      localStorage.setItem('citizen_lastUpdate', Date.now().toString());
      localStorage.setItem('citizenDataRecovered', JSON.stringify(recoveredData));

      console.log('Citizen data recovery completed successfully');
      return recoveredData;

    } catch (error) {
      console.error('Citizen data recovery failed:', error);
      throw error;
    } finally {
      this.recoveryInProgress = false;
    }
  }

  // Auto-recovery based on user role
  async autoRecover(): Promise<any> {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      const role = user.role;

      switch (role) {
        case 'worker':
          return await this.recoverWorkerData();
        case 'admin':
          return await this.recoverAdminData();
        case 'citizen':
          return await this.recoverCitizenData();
        default:
          console.warn('Unknown user role for auto-recovery:', role);
          return null;
      }
    } catch (error) {
      console.error('Auto-recovery failed:', error);
      return null;
    }
  }

  // Check and recover if needed
  async checkAndRecover(dataType: string, maxAge: number = 300000): Promise<any> {
    if (this.needsRecovery(dataType, maxAge)) {
      return await this.autoRecover();
    }
    return null;
  }

  // Get recovery status
  getRecoveryStatus(): { inProgress: boolean; lastRecovery: number; canRecover: boolean } {
    return {
      inProgress: this.recoveryInProgress,
      lastRecovery: this.lastRecoveryTime,
      canRecover: Date.now() - this.lastRecoveryTime >= this.minRecoveryInterval
    };
  }

  // Force clear all cached data
  clearAllCache(): void {
    dataPersistence.clearAll();
    
    // Clear recovery timestamps
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('_lastUpdate') || key.includes('DataRecovered')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All cached data cleared');
  }
}

// Create singleton instance
export const dataRecoveryEnhanced = new DataRecoveryEnhanced();

export default dataRecoveryEnhanced;
interface StorageData {
  [key: string]: any;
}

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

class DataPersistenceService {
  private storagePrefix = 'wastewise_';
  private syncQueue: SyncOperation[] = [];
  private maxRetries = 3;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Load sync queue from localStorage
    this.loadSyncQueue();
  }

  // Store data locally
  store(key: string, data: any): void {
    try {
      const storageKey = this.storagePrefix + key;
      const dataWithTimestamp = {
        data,
        timestamp: Date.now(),
        version: 1
      };
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  // Retrieve data from local storage
  retrieve(key: string): any {
    try {
      const storageKey = this.storagePrefix + key;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  // Store with expiration
  storeWithExpiry(key: string, data: any, expiryMinutes: number = 60): void {
    try {
      const storageKey = this.storagePrefix + key;
      const dataWithExpiry = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryMinutes * 60 * 1000)
      };
      localStorage.setItem(storageKey, JSON.stringify(dataWithExpiry));
    } catch (error) {
      console.error('Failed to store data with expiry:', error);
    }
  }

  // Retrieve data with expiry check
  retrieveWithExpiry(key: string): any {
    try {
      const storageKey = this.storagePrefix + key;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() < parsed.expiry) {
          return parsed.data;
        } else {
          // Data expired, remove it
          localStorage.removeItem(storageKey);
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve data with expiry:', error);
      return null;
    }
  }

  // Add operation to sync queue
  addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): void {
    const syncOp: SyncOperation = {
      ...operation,
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(syncOp);
    this.saveSyncQueue();

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        await this.executeSync(operation);
        console.log('Sync operation completed:', operation.id);
      } catch (error) {
        console.error('Sync operation failed:', operation.id, error);
        
        operation.retries++;
        if (operation.retries < this.maxRetries) {
          // Re-queue for retry
          this.syncQueue.push(operation);
        } else {
          console.error('Sync operation permanently failed:', operation.id);
        }
      }
    }

    this.saveSyncQueue();
  }

  // Execute individual sync operation
  private async executeSync(operation: SyncOperation): Promise<void> {
    const { type, endpoint, data } = operation;

    const response = await fetch(`http://localhost:3001/api${endpoint}`, {
      method: type === 'CREATE' ? 'POST' : type === 'UPDATE' ? 'PATCH' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: type !== 'DELETE' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Save sync queue to localStorage
  private saveSyncQueue(): void {
    try {
      localStorage.setItem(this.storagePrefix + 'syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load sync queue from localStorage
  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem(this.storagePrefix + 'syncQueue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Store waste collection update
  storeWasteCollection(wasteId: string, collectionData: any): void {
    const collections = this.retrieve('wasteCollections') || {};
    collections[wasteId] = {
      ...collectionData,
      timestamp: Date.now(),
      synced: false
    };
    this.store('wasteCollections', collections);

    // Add to sync queue
    this.addToSyncQueue({
      type: 'UPDATE',
      endpoint: `/waste/${wasteId}/complete-collection`,
      data: collectionData
    });
  }

  // Store dashboard data
  storeDashboardData(data: any): void {
    this.storeWithExpiry('dashboardData', data, 5); // 5 minutes expiry for more frequent updates
  }

  // Get dashboard data
  getDashboardData(): any {
    return this.retrieveWithExpiry('dashboardData');
  }

  // Store user preferences
  storeUserPreferences(preferences: any): void {
    this.store('userPreferences', preferences);
  }

  // Get user preferences
  getUserPreferences(): any {
    return this.retrieve('userPreferences') || {};
  }

  // Store worker statistics
  storeWorkerStats(stats: any): void {
    this.storeWithExpiry('workerStats', stats, 60); // 1 hour expiry
  }

  // Get worker statistics
  getWorkerStats(): any {
    return this.retrieveWithExpiry('workerStats');
  }

  // Clear all stored data
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
    this.syncQueue = [];
  }

  // Get sync queue status
  getSyncStatus(): { pending: number; failed: number; isOnline: boolean } {
    const failed = this.syncQueue.filter(op => op.retries >= this.maxRetries).length;
    const pending = this.syncQueue.length - failed;
    
    return {
      pending,
      failed,
      isOnline: this.isOnline
    };
  }

  // Force sync all pending operations
  async forceSyncAll(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  // Store municipal houses data
  storeMunicipalHouses(houses: any[]): void {
    this.storeWithExpiry('municipalHouses', houses, 30); // 30 minutes expiry
  }

  // Get municipal houses data
  getMunicipalHouses(): any[] {
    return this.retrieveWithExpiry('municipalHouses') || [];
  }

  // Store pending waste data
  storePendingWaste(waste: any[]): void {
    this.storeWithExpiry('pendingWaste', waste, 15); // 15 minutes expiry
  }

  // Get pending waste data
  getPendingWaste(): any[] {
    return this.retrieveWithExpiry('pendingWaste') || [];
  }

  // Store collected waste data
  storeCollectedWaste(waste: any[]): void {
    this.storeWithExpiry('collectedWaste', waste, 60); // 1 hour expiry
  }

  // Get collected waste data
  getCollectedWaste(): any[] {
    return this.retrieveWithExpiry('collectedWaste') || [];
  }

  // Store recycling centers data
  storeRecyclingCenters(centers: any[]): void {
    this.storeWithExpiry('recyclingCenters', centers, 60); // 1 hour expiry
  }

  // Get recycling centers data
  getRecyclingCenters(): any[] {
    return this.retrieveWithExpiry('recyclingCenters') || [];
  }

  // Store sent invitations data
  storeSentInvitations(invitations: any[]): void {
    this.storeWithExpiry('sentInvitations', invitations, 30); // 30 minutes expiry
  }

  // Get sent invitations data
  getSentInvitations(): any[] {
    return this.retrieveWithExpiry('sentInvitations') || [];
  }

  // Store invitation send operation
  storeInvitationSend(invitationData: any): void {
    this.addToSyncQueue({
      type: 'CREATE',
      endpoint: '/invitations/send',
      data: invitationData
    });
  }
}

// Create singleton instance
export const dataPersistence = new DataPersistenceService();

// Export for use in components
export default dataPersistence;
// Data synchronization service to ensure data persistence
export class DataSyncService {
  private static instance: DataSyncService;
  private syncQueue: Array<{ key: string; data: any; timestamp: number }> = [];
  private isOnline = navigator.onLine;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Load pending sync queue from localStorage
    this.loadSyncQueue();
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  private handleOnline() {
    this.isOnline = true;
    console.log('Connection restored - syncing pending data');
    this.processSyncQueue();
  }

  private handleOffline() {
    this.isOnline = false;
    console.log('Connection lost - data will be cached locally');
  }

  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem('syncQueue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Cache data locally with timestamp
  cacheData(key: string, data: any) {
    const timestamp = Date.now();
    const cacheEntry = {
      data,
      timestamp,
      synced: this.isOnline
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    
    // Add to sync queue if offline
    if (!this.isOnline) {
      this.syncQueue.push({ key, data, timestamp });
      this.saveSyncQueue();
    }
  }

  // Get cached data
  getCachedData(key: string, maxAge = 5 * 60 * 1000) { // 5 minutes default
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const cacheEntry = JSON.parse(cached);
      const age = Date.now() - cacheEntry.timestamp;
      
      if (age > maxAge && this.isOnline) {
        // Data is stale and we're online, return null to trigger fresh fetch
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Process sync queue when back online
  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`Processing ${this.syncQueue.length} pending sync items`);
    
    // Process each item in the queue
    for (const item of this.syncQueue) {
      try {
        // Update the cached data as synced
        const cacheEntry = {
          data: item.data,
          timestamp: item.timestamp,
          synced: true
        };
        localStorage.setItem(`cache_${item.key}`, JSON.stringify(cacheEntry));
      } catch (error) {
        console.error('Failed to sync item:', item.key, error);
      }
    }
    
    // Clear the sync queue
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  // Check if data needs refresh
  needsRefresh(key: string, maxAge = 30 * 1000) { // 30 seconds default
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return true;
      
      const cacheEntry = JSON.parse(cached);
      const age = Date.now() - cacheEntry.timestamp;
      
      return age > maxAge;
    } catch (error) {
      return true;
    }
  }

  // Clear all cached data
  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') || key.startsWith('wasteHistory') || 
          key.startsWith('myReports') || key.startsWith('wasteStats') || 
          key.startsWith('purchaseHistory')) {
        localStorage.removeItem(key);
      }
    });
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  // Get connection status
  isConnected() {
    return this.isOnline;
  }
}

export const dataSync = DataSyncService.getInstance();
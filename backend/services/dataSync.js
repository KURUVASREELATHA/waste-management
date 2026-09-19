import mongoose from 'mongoose';

class DataSyncService {
  constructor() {
    this.syncQueue = [];
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Add operation to sync queue
  addToQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: new Date(),
      attempts: 0,
      id: Date.now() + Math.random()
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Process sync queue
  async processQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing sync queue: ${this.syncQueue.length} operations`);

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      
      try {
        await this.executeOperation(operation);
        console.log(`Sync operation completed: ${operation.type} - ${operation.id}`);
      } catch (error) {
        console.error(`Sync operation failed: ${operation.type} - ${operation.id}`, error);
        
        operation.attempts++;
        if (operation.attempts < this.retryAttempts) {
          // Re-queue for retry
          setTimeout(() => {
            this.syncQueue.unshift(operation);
            if (!this.isProcessing) {
              this.processQueue();
            }
          }, this.retryDelay * operation.attempts);
        } else {
          console.error(`Sync operation permanently failed after ${this.retryAttempts} attempts:`, operation);
        }
      }
    }

    this.isProcessing = false;
  }

  // Execute individual sync operation
  async executeOperation(operation) {
    const { type, model, data, filter } = operation;

    switch (type) {
      case 'CREATE':
        return await this.createDocument(model, data);
      case 'UPDATE':
        return await this.updateDocument(model, filter, data);
      case 'DELETE':
        return await this.deleteDocument(model, filter);
      case 'UPSERT':
        return await this.upsertDocument(model, filter, data);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Create document
  async createDocument(modelName, data) {
    const Model = mongoose.model(modelName);
    const document = new Model(data);
    return await document.save();
  }

  // Update document
  async updateDocument(modelName, filter, data) {
    const Model = mongoose.model(modelName);
    return await Model.findOneAndUpdate(filter, data, { new: true, upsert: false });
  }

  // Delete document
  async deleteDocument(modelName, filter) {
    const Model = mongoose.model(modelName);
    return await Model.findOneAndDelete(filter);
  }

  // Upsert document
  async upsertDocument(modelName, filter, data) {
    const Model = mongoose.model(modelName);
    return await Model.findOneAndUpdate(filter, data, { new: true, upsert: true });
  }

  // Sync waste collection
  syncWasteCollection(wasteId, collectorId, completionData = {}) {
    this.addToQueue({
      type: 'UPDATE',
      model: 'Waste',
      filter: { _id: wasteId },
      data: {
        status: 'collected',
        collectedBy: collectorId,
        collectedAt: new Date(),
        ...completionData
      }
    });
  }

  // Sync user data
  syncUserData(userId, userData) {
    this.addToQueue({
      type: 'UPSERT',
      model: 'User',
      filter: { _id: userId },
      data: userData
    });
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      pendingOperations: this.syncQueue.map(op => ({
        id: op.id,
        type: op.type,
        model: op.model,
        attempts: op.attempts,
        timestamp: op.timestamp
      }))
    };
  }

  // Clear queue
  clearQueue() {
    this.syncQueue = [];
    this.isProcessing = false;
  }

  // Force process queue
  async forceProcessQueue() {
    this.isProcessing = false;
    await this.processQueue();
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();

export default dataSyncService;
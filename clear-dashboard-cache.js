// Simple script to clear dashboard cache
// Run this in browser console or add to your app

const clearDashboardCache = () => {
  console.log('Clearing dashboard cache...');
  
  const keys = Object.keys(localStorage);
  let clearedCount = 0;
  
  keys.forEach(key => {
    if (key.includes('dashboard') || 
        key.includes('stats') || 
        key.includes('wastewise_dashboardData') ||
        key.includes('wastewise_workerStats') ||
        key.includes('lastDashboardClear')) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log('Cleared:', key);
    }
  });
  
  // Set new clear date
  localStorage.setItem('lastDashboardClear', new Date().toDateString());
  
  console.log(`✅ Cleared ${clearedCount} cached items`);
  console.log('🔄 Please refresh the page to see updated data');
  
  return clearedCount;
};

// Auto-execute if running in browser
if (typeof window !== 'undefined') {
  clearDashboardCache();
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = clearDashboardCache;
}
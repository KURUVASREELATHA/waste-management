// Get dashboard statistics (also handle route without municipalId)
router.get('/dashboard-stats', async (req, res) => {
  try {
    console.log('Dashboard stats request (no municipalId)');
    
    const [pendingCollections, collectedToday, totalCollected, monthlyCollected, reportWasteToday, reportWasteTotal, reportWasteMonthly] = await Promise.all([
      Waste.countDocuments({ status: 'pending' }),
      Waste.aggregate([
        {
          $match: {
            status: 'collected',
            collectedAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' }, count: { $sum: 1 } } }
      ]),
      Waste.aggregate([
        { $match: { status: 'collected' } },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      Waste.aggregate([
        {
          $match: {
            status: 'collected',
            collectedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      // Get waste from resolved reports today
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get total waste from resolved reports
      mongoose.model('Report').aggregate([
        { $match: { status: 'resolved' } },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get monthly waste from resolved reports
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ])
    ]);
    
    const todayData = collectedToday[0] || { total: 0, count: 0 };
    const totalData = totalCollected[0] || { total: 0 };
    const monthlyData = monthlyCollected[0] || { total: 0 };
    const reportTodayData = reportWasteToday[0] || { total: 0 };
    const reportTotalData = reportWasteTotal[0] || { total: 0 };
    const reportMonthlyData = reportWasteMonthly[0] || { total: 0 };
    
    // Get total households (users)
    const User = mongoose.model('User');
    const totalHouseholds = await User.countDocuments({ role: 'citizen' });
    
    const collectionRate = totalHouseholds > 0 ? Math.round((todayData.count / totalHouseholds) * 100) : 0;
    
    const result = {
      totalHouseholds: totalHouseholds || 0,
      wasteCollectedToday: (todayData.total || 0) + (reportTodayData.total || 0),
      collectionsToday: todayData.count || 0,
      pendingCollections: pendingCollections || 0,
      collectionRate: Math.min(collectionRate || 0, 100),
      totalCollected: (totalData.total || 0) + (reportTotalData.total || 0),
      monthlyTotal: (monthlyData.total || 0) + (reportMonthlyData.total || 0)
    };
    
    console.log('Dashboard stats result (no municipalId):', result);
    res.json(result);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});
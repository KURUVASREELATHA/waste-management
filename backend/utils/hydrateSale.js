import Citizen from '../models/Citizen.js';
import Municipality from '../models/Municipality.js';
import RecyclingCenter from '../models/RecyclingCenter.js';

/**
 * Users are stored in separate collections (citizens / municipalities / recyclingcenters)
 * depending on role, so populating WasteSale.sellerId / recyclerId against a single
 * 'User' model returns null. This helper resolves the referenced users from the
 * correct collections and returns plain objects shaped like the old populate result.
 */
async function resolveUsers(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  if (uniqueIds.length === 0) return new Map();

  const [citizens, municipalities, centers] = await Promise.all([
    Citizen.find({ _id: { $in: uniqueIds } }).select('name email phone role houseId workerId').lean(),
    Municipality.find({ _id: { $in: uniqueIds } }).select('name email phone role workerId').lean(),
    RecyclingCenter.find({ _id: { $in: uniqueIds } }).select('name email phone centerName').lean()
  ]);

  const map = new Map();
  citizens.forEach(u => map.set(String(u._id), { ...u, role: 'citizen' }));
  municipalities.forEach(u => map.set(String(u._id), { ...u }));
  centers.forEach(u => map.set(String(u._id), { ...u, role: 'recycler' }));
  return map;
}

export async function hydrateSales(sales) {
  const list = Array.isArray(sales) ? sales : [sales];
  const userMap = await resolveUsers([
    ...list.map(s => s.sellerId),
    ...list.map(s => s.recyclerId)
  ]);

  return list.map(sale => {
    const doc = sale.toObject ? sale.toObject() : { ...sale };
    const sellerId = doc.sellerId ? String(doc.sellerId._id || doc.sellerId) : null;
    const recyclerId = doc.recyclerId ? String(doc.recyclerId._id || doc.recyclerId) : null;
    return {
      ...doc,
      sellerId: sellerId ? (userMap.get(sellerId) || null) : null,
      recyclerId: recyclerId ? (userMap.get(recyclerId) || null) : null
    };
  });
}

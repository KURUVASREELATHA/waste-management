import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Citizen from '../models/Citizen.js';
import Municipality from '../models/Municipality.js';
import RecyclingCenter from '../models/RecyclingCenter.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in different models
    let user = null;
    let userRole = null;
    
    // Check Citizen model
    user = await Citizen.findById(decoded.userId);
    if (user) {
      userRole = 'citizen';
    } else {
      // Check Municipality model
      user = await Municipality.findById(decoded.userId);
      if (user) {
        userRole = user.role || 'worker';
      } else {
        // Check RecyclingCenter model
        user = await RecyclingCenter.findById(decoded.userId);
        if (user) {
          userRole = 'recycler';
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.userId = decoded.userId;
    req.user = { 
      id: decoded.userId, 
      role: userRole,
      municipalId: user.municipalId,
      name: user.name,
      email: user.email
    };
    next();
  } catch (error) {

    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
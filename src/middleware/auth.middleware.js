import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';

export async function verifyToken(req, res, next) {
  try {
    const token = req.cookies.recipehub_token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'recipehub',
    });

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked' });
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication required' });
  }
}

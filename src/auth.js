import jwt from 'jsonwebtoken';
import { User } from './models.js';

const cookieOptions = () => ({ httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
export const issueAuthCookie = (res, user) => {
  const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'recipehub' });
  res.cookie('recipehub_token', token, cookieOptions());
};
export const clearAuthCookie = res => res.clearCookie('recipehub_token', cookieOptions());
export const authRequired = async (req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.recipehub_token, process.env.JWT_SECRET, { issuer: 'recipehub' });
    const user = await User.findById(payload.sub);
    if (!user || user.isBlocked) return res.status(403).json({ message: user?.isBlocked ? 'Your account is blocked' : 'Authentication required' });
    req.user = user; next();
  } catch { res.status(401).json({ message: 'Authentication required' }); }
};
export const adminRequired = [authRequired, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' })];
export const publicUser = u => ({ id: u._id, name: u.name, email: u.email, image: u.image, role: u.role, isPremium: u.isPremium, isBlocked: u.isBlocked });

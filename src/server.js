import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { z } from 'zod';
import { User, Recipe, Favorite, Report, Payment } from './models.js';
import { authRequired, adminRequired, issueAuthCookie, clearAuthCookie, publicUser } from './auth.js';
import { betterAuthInstance } from './betterAuth.js';

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('MONGODB_URI and JWT_SECRET are required');
await mongoose.connect(process.env.MONGODB_URI);
const app = express();
app.all('/api/auth/better/*splat', toNodeHandler(betterAuthInstance));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' })); app.use(cookieParser(process.env.COOKIE_SECRET)); app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 100 }));

const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const authSchema = z.object({ name: z.string().min(2).optional(), email: z.string().email(), image: z.string().url().or(z.literal('')).optional(), password: z.string().min(6).regex(/[A-Z]/).regex(/[a-z]/) });
app.get('/api/health', (_,res) => res.json({ ok: true }));
app.post('/api/auth/register', asyncRoute(async (req,res) => {
  const data = authSchema.extend({ name: z.string().min(2) }).parse(req.body);
  if (await User.exists({ email: data.email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered' });
  const user = await User.create({ name: data.name, email: data.email, image: data.image, passwordHash: await bcrypt.hash(data.password, 12) });
  issueAuthCookie(res,user); res.status(201).json({ user: publicUser(user) });
}));
app.post('/api/auth/login', asyncRoute(async (req,res) => {
  const data = authSchema.pick({email:true,password:true}).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');
  if (!user || !await bcrypt.compare(data.password,user.passwordHash || '')) return res.status(401).json({ message: 'Invalid email or password' });
  if (user.isBlocked) return res.status(403).json({ message: 'Your account is blocked' });
  issueAuthCookie(res,user); res.json({ user: publicUser(user) });
}));
app.post('/api/auth/logout', (_,res) => { clearAuthCookie(res); res.json({ ok:true }); });
app.get('/api/auth/session', authRequired, (req,res) => res.json({ user: publicUser(req.user) }));
app.post('/api/auth/exchange', asyncRoute(async (req,res) => {
  const session = await betterAuthInstance.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session?.user) return res.status(401).json({ message: 'Better Auth session not found' });
  const user = await User.findOneAndUpdate({ email: session.user.email.toLowerCase() },
    { $set: { name: session.user.name || session.user.email.split('@')[0], image: session.user.image || '' }, $setOnInsert: { role:'user',isPremium:false,isBlocked:false } },
    { upsert:true,new:true });
  if (user.isBlocked) return res.status(403).json({ message:'Your account is blocked' });
  issueAuthCookie(res,user); res.json({ user:publicUser(user) });
}));

app.get('/api/recipes', asyncRoute(async (req,res) => {
  const page = Math.max(1,Number(req.query.page)||1), limit = Math.min(24,Math.max(1,Number(req.query.limit)||8));
  const query = { status:'published' };
  if (req.query.category) query.category = { $in: String(req.query.category).split(',') };
  if (req.query.cuisine) query.cuisineType = { $in: String(req.query.cuisine).split(',') };
  if (req.query.difficulty) query.difficultyLevel = { $in: String(req.query.difficulty).split(',') };
  if (req.query.featured) query.isFeatured = true;
  if (req.query.search) query.$or = ['recipeName','category','cuisineType'].map(k => ({ [k]: { $regex: req.query.search, $options:'i' } }));
  const sort = req.query.sort === 'popular' ? { likesCount:-1 } : { createdAt:-1 };
  const [items,total] = await Promise.all([Recipe.find(query).sort(sort).skip((page-1)*limit).limit(limit).lean(),Recipe.countDocuments(query)]);
  res.json({ items,total,page,pages:Math.ceil(total/limit) });
}));
app.get('/api/recipes/:id', asyncRoute(async (req,res) => { const item=await Recipe.findById(req.params.id).lean(); if(!item) return res.status(404).json({message:'Recipe not found'}); res.json(item); }));
app.post('/api/recipes', authRequired, asyncRoute(async (req,res) => {
  if (!req.user.isPremium && await Recipe.countDocuments({authorId:req.user._id}) >= 2) return res.status(403).json({message:'Free members can publish up to 2 recipes'});
  const item=await Recipe.create({...req.body,authorId:req.user._id,authorName:req.user.name,authorEmail:req.user.email}); res.status(201).json(item);
}));
app.patch('/api/recipes/:id', authRequired, asyncRoute(async (req,res) => {
  const item=await Recipe.findById(req.params.id); if(!item) return res.status(404).json({message:'Recipe not found'});
  if(req.user.role!=='admin' && !item.authorId.equals(req.user._id)) return res.status(403).json({message:'Not allowed'});
  const safe={...req.body}; delete safe.authorId; delete safe.likesCount; Object.assign(item,safe); await item.save(); res.json(item);
}));
app.delete('/api/recipes/:id', authRequired, asyncRoute(async(req,res)=>{const item=await Recipe.findById(req.params.id);if(!item)return res.status(404).json({message:'Recipe not found'});if(req.user.role!=='admin'&&!item.authorId.equals(req.user._id))return res.status(403).json({message:'Not allowed'});await Promise.all([item.deleteOne(),Favorite.deleteMany({recipeId:item._id}),Report.deleteMany({recipeId:item._id})]);res.json({ok:true});}));
app.post('/api/recipes/:id/like', authRequired, asyncRoute(async(req,res)=>{const item=await Recipe.findById(req.params.id);const i=item.likedBy.findIndex(x=>x.equals(req.user._id));if(i>=0)item.likedBy.splice(i,1);else item.likedBy.push(req.user._id);item.likesCount=item.likedBy.length;await item.save();res.json({likesCount:item.likesCount,liked:i<0});}));
app.get('/api/me/recipes', authRequired, asyncRoute(async(req,res)=>res.json(await Recipe.find({authorId:req.user._id}).sort({createdAt:-1}))));
app.get('/api/me/favorites', authRequired, asyncRoute(async(req,res)=>res.json(await Favorite.find({userId:req.user._id}).populate('recipeId').sort({addedAt:-1}))));
app.post('/api/favorites/:recipeId', authRequired, asyncRoute(async(req,res)=>{const found=await Favorite.findOne({userId:req.user._id,recipeId:req.params.recipeId});if(found){await found.deleteOne();return res.json({favorite:false});}await Favorite.create({userId:req.user._id,userEmail:req.user.email,recipeId:req.params.recipeId});res.status(201).json({favorite:true});}));
app.post('/api/reports', authRequired, asyncRoute(async(req,res)=>res.status(201).json(await Report.create({recipeId:req.body.recipeId,reporterEmail:req.user.email,reason:req.body.reason}))));
app.get('/api/me/purchases', authRequired, asyncRoute(async(req,res)=>res.json(await Payment.find({userId:req.user._id,recipeId:{$ne:null},paymentStatus:'paid'}).populate('recipeId').sort({paidAt:-1}))));
app.patch('/api/me/profile', authRequired, asyncRoute(async(req,res)=>{if(req.body.name)req.user.name=req.body.name;if(req.body.image!==undefined)req.user.image=req.body.image;await req.user.save();res.json({user:publicUser(req.user)});}));
app.get('/api/me/stats', authRequired, asyncRoute(async(req,res)=>{const [recipes,favorites,likes,purchases]=await Promise.all([Recipe.countDocuments({authorId:req.user._id}),Favorite.countDocuments({userId:req.user._id}),Recipe.aggregate([{$match:{authorId:req.user._id}},{$group:{_id:null,total:{$sum:'$likesCount'}}}]),Payment.countDocuments({userId:req.user._id,paymentStatus:'paid'})]);res.json({recipes,favorites,likes:likes[0]?.total||0,purchases});}));

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
app.post('/api/payments/checkout', authRequired, asyncRoute(async(req,res)=>{if(!stripe)return res.status(503).json({message:'Stripe is not configured'});const recipe=req.body.recipeId?await Recipe.findById(req.body.recipeId):null;const membership=!recipe;const amount=membership?Number(process.env.PREMIUM_PRICE||999):Math.round(recipe.price*100);const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],line_items:[{quantity:1,price_data:{currency:'usd',unit_amount:amount,product_data:{name:membership?'RecipeHub Premium Membership':recipe.recipeName}}}],success_url:`${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${process.env.CLIENT_URL}${recipe?`/recipes/${recipe._id}`:'/pricing'}`,metadata:{userId:String(req.user._id),recipeId:recipe?String(recipe._id):'',type:membership?'premium':'recipe'}});res.json({url:session.url});}));
app.post('/api/payments/confirm', authRequired, asyncRoute(async(req,res)=>{if(!stripe)return res.status(503).json({message:'Stripe is not configured'});const s=await stripe.checkout.sessions.retrieve(req.body.sessionId);if(s.payment_status!=='paid'||s.metadata.userId!==String(req.user._id))return res.status(400).json({message:'Payment not completed'});await Payment.findOneAndUpdate({transactionId:s.payment_intent},{userEmail:req.user.email,userId:req.user._id,amount:s.amount_total/100,recipeId:s.metadata.recipeId||null,transactionId:s.payment_intent,paymentStatus:'paid',paidAt:new Date()},{upsert:true,new:true});if(s.metadata.type==='premium'){req.user.isPremium=true;await req.user.save();}res.json({ok:true,user:publicUser(req.user)});}));

app.get('/api/admin/stats', ...adminRequired, asyncRoute(async(req,res)=>{const [users,recipes,premium,reports]=await Promise.all([User.countDocuments(),Recipe.countDocuments(),User.countDocuments({isPremium:true}),Report.countDocuments({status:'pending'})]);res.json({users,recipes,premium,reports});}));
app.get('/api/admin/users', ...adminRequired, asyncRoute(async(req,res)=>res.json(await User.find().sort({createdAt:-1}))));
app.patch('/api/admin/users/:id/block', ...adminRequired, asyncRoute(async(req,res)=>res.json(await User.findByIdAndUpdate(req.params.id,{isBlocked:req.body.isBlocked},{new:true}))));
app.get('/api/admin/recipes', ...adminRequired, asyncRoute(async(req,res)=>res.json(await Recipe.find().sort({createdAt:-1}))));
app.patch('/api/admin/recipes/:id/feature', ...adminRequired, asyncRoute(async(req,res)=>res.json(await Recipe.findByIdAndUpdate(req.params.id,{isFeatured:req.body.isFeatured},{new:true}))));
app.get('/api/admin/reports', ...adminRequired, asyncRoute(async(req,res)=>res.json(await Report.find().populate('recipeId').sort({createdAt:-1}))));
app.patch('/api/admin/reports/:id', ...adminRequired, asyncRoute(async(req,res)=>res.json(await Report.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true}))));
app.get('/api/admin/payments', ...adminRequired, asyncRoute(async(req,res)=>res.json(await Payment.find().populate('userId','name email').sort({paidAt:-1}))));

app.use((err,req,res,next)=>{console.error(err);if(err instanceof z.ZodError)return res.status(400).json({message:err.issues[0].message,issues:err.issues});res.status(err.status||500).json({message:process.env.NODE_ENV==='production'?'Something went wrong':err.message});});
app.listen(process.env.PORT||5000,()=>console.log(`RecipeHub API running on ${process.env.PORT||5000}`));

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import { sendEmail } from '../utils/sendEmail.js';

const ACCESS_TTL_MIN = Number(process.env.ACCESS_TOKEN_TTL_MIN || 15);
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const genToken = () => crypto.randomBytes(32).toString('hex');

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw createHttpError(409, 'Email in use');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
  });
  return user; // toJSON password'u siler
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw createHttpError(401, 'Unauthorized');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw createHttpError(401, 'Unauthorized');

  // Eski session'ı sil
  await Session.deleteMany({ userId: user._id });

  const accessToken = genToken();
  const refreshToken = genToken();

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: minutesFromNow(ACCESS_TTL_MIN),
    refreshTokenValidUntil: daysFromNow(REFRESH_TTL_DAYS),
  });

  return { user, session };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'Unauthorized');

  const old = await Session.findOne({ refreshToken });
  if (!old) throw createHttpError(401, 'Unauthorized');

  if (new Date() > new Date(old.refreshTokenValidUntil)) {
    await Session.deleteOne({ _id: old._id });
    throw createHttpError(401, 'Unauthorized');
  }

  const userId = old.userId;

  // eskiyi sil, yeniyi oluştur
  await Session.deleteOne({ _id: old._id });

  const accessToken = genToken();
  const newRefreshToken = genToken();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: minutesFromNow(ACCESS_TTL_MIN),
    refreshTokenValidUntil: daysFromNow(REFRESH_TTL_DAYS),
  });

  return session;
};

export const logoutSession = async (refreshToken) => {
  if (!refreshToken) return;
  await Session.deleteOne({ refreshToken });
};
export async function sendResetPasswordEmail(email) {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset password',
    html: `<p>Şifrenizi sıfırlamak için link:</p><a href="${resetLink}">${resetLink}</a>`,
  });

  return true;
}

export async function resetPasswordByToken(token, newPassword) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found!');

  const hash = await bcrypt.hash(newPassword, 10);
  await UsersCollection.updateOne({ _id: user._id }, { password: hash });

  // tüm session'ları sil (accept kriteri: "mevcut oturumu sil")
  await SessionsCollection.deleteMany({ userId: user._id });

  return true;
}

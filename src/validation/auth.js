import * as yup from 'yup';

const s = (r = false) => (r ? yup.string().required() : yup.string());

export const registerSchema = yup.object({
  name: s(true).min(3).max(20),
  email: s(true).email().min(3).max(50),
  password: s(true).min(6).max(50),
});

export const loginSchema = yup.object({
  email: s(true).email().min(3).max(50),
  password: s(true).min(6).max(50),
});
const str3to20 = yup.string().min(3).max(20);

export const sendResetEmailSchema = yup.object({
  email: yup.string().email().required(),
});

export const resetPwdSchema = yup.object({
  token: yup.string().required(),
  password: str3to20.required(),
});

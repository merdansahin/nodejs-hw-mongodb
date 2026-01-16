import {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession,
  sendResetPasswordEmail,
  resetPasswordByToken,
} from '../services/auth.js';

const COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/auth',
};

export const registerController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginController = async (req, res) => {
  const { session } = await loginUser(req.body);

  res.cookie(COOKIE_NAME, session.refreshToken, {
    ...cookieOptions,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const refreshController = async (req, res) => {
  const token = req.cookies?.refreshToken;
  const session = await refreshSession(token);

  res.cookie('refreshToken', session.refreshToken, {
    ...cookieOptions,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutController = async (req, res) => {
  const token = req.cookies?.refreshToken;
  await logoutSession(token);

  res.clearCookie('refreshToken', cookieOptions);
  res.status(204).send();
};
export const sendResetEmailController = async (req, res) => {
  await sendResetPasswordEmail(req.body.email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPwdController = async (req, res) => {
  const { token, password } = req.body;

  await resetPasswordByToken(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

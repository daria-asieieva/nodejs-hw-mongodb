import { 
  register as registerService, 
  login as loginService,
  refresh as refreshService,
  logout as logoutService,
} from '../services/auth.js';

export const register = async (req, res) => {
  const newUser = await registerService(req.body);
  
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: newUser,
  });
};

export const login = async (req, res) => {
  const { accessToken, refreshToken } = await loginService(req.body);
  
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  });
  
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await refreshService(refreshToken);
  
  
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  });
  
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutService(refreshToken);
  

  res.clearCookie('refreshToken');
  
  res.status(204).send();
};
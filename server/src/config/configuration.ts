export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  wxMockOpenid: process.env.WX_MOCK_OPENID === 'true',
  logLevel: process.env.LOG_LEVEL ?? 'info',
});

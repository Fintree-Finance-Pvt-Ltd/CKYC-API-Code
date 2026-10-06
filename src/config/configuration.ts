export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5100', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  befisc: {
    baseUrl: process.env.BEFISC_BASE_URL || 'https://prod.smartauth.co',
    authKey: process.env.BEFISC_AUTH_KEY || '',
  },
  netwin: {
    baseUrl: process.env.NETWIN_BASE_URL || '',
    clientId: process.env.NETWIN_CLIENT_ID || '',
    clientSecret: process.env.NETWIN_CLIENT_SECRET || '',
  },
  ckyc: {
    defaultConsentText:
      process.env.CKYC_DEFAULT_CONSENT_TEXT ||
      'We confirm obtaining valid customer consent to access/process their CKYC data. Consent remains valid, informed, and unwithdrawn.',
    httpTimeoutMs: parseInt(process.env.HTTP_TIMEOUT_MS || '30000', 10),
    apiKeyPepper: process.env.API_KEY_PEPPER || 'DEFAULT_FINTREE_PEPPER',
  },
});

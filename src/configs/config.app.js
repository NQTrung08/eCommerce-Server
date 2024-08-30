const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
    redirectUrl: process.env.DEV_REDIRECT_URL,
    callbackUrl: process.env.DEV_CALLBACK_URL,
  },
}

const pro = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
    redirectUrl: process.env.PRO_REDIRECT_URL,
    callbackUrl: process.env.PRO_CALLBACK_URL,
  },
}

const config = { dev, pro };
const env = process.env.NODE_ENV || 'dev';

console.log(config[env], env);

module.exports = config[env];
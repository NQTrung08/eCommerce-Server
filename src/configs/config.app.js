const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
    redirectUrl: process.env.DEV_REDIRECT_URL,
    callbackUrl: process.env.DEV_CALLBACK_URL,
    url: 'http://localhost:8080',
    resetPasswordUrl: process.env.DEV_RESET_PASSWORD_LINK,
    
  },
  vnpay: {
    vnp_ReturnUrl: process.env.DEV_VNP_RETURN_URL,
  },
  momo: {
    momo_ReturnUrl: process.env.DEV_MOMO_RETURN_URL,
  }
}

const pro = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
    redirectUrl: process.env.PRO_REDIRECT_URL,
    callbackUrl: process.env.PRO_CALLBACK_URL,
    url: 'https://ecommerce-server-0mcc.onrender.com',
    resetPasswordUrl: process.env.PRO_RESET_PASSWORD_LINK
  },
  vnpay: {
    vnp_ReturnUrl: process.env.PRO_VNP_RETURN_URL,
  },
  momo: {
    momo_ReturnUrl: process.env.PRO_MOMO_RETURN_URL
  }
}

const config = { dev, pro };
const env = process.env.NODE_ENV || 'dev';

console.log(config[env], env);

module.exports = config[env];
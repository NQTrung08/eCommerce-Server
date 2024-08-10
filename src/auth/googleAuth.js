const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');
const { ConflictError, InternalServerError, BadRequestError } = require('../core/error.response');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8080/v1/api/auth/google/callback',
  scope: ['profile', 'email', 'openid'] // Cấu hình các phạm vi yêu cầu
},
async (accessToken, refreshToken, profile, done) => {
  
  console.log('Google OAuth callback:', profile); // Log profile info
  console.log('Google OAuth accesstoken:', accessToken); // Log profile info
  try {
    const user = await userModel.findOne({ email: profile.emails[0].value }).lean();
    console.log('User found:', user); // Log user found in DB
    if (user) {
      return done(null, user);
    }

    const defaultRole = await roleModel.findOne({ roleName: 'user' }).lean();
    if (!defaultRole) {
      throw new InternalServerError('Default role not found');
    }

    const newUser = await userModel.create({
      userName: profile.displayName,
      full_name: profile.displayName,
      email: profile.emails[0].value,
      provider: 'google',
      providerId: profile.id,
      roles: [defaultRole._id],
    });

    return done(null, newUser);

  } catch (error) {
    return done(error, null);
  }
}
));

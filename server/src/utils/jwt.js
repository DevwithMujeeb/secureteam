const jwt = require("jsonwebtoken");
const config = require("../config/env");

/**
 * Sign a short-lived access token. Payload is intentionally minimal —
 * just enough to identify the user on each request without a DB hit.
 */
const signAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
};

/**
 * Sign a longer-lived refresh token. Includes `tokenVersion` so that
 * incrementing User.refreshTokenVersion instantly invalidates every
 * refresh token issued before that point (e.g. on logout-all or
 * suspected compromise) without needing a token blacklist.
 */
const signRefreshToken = (userId, tokenVersion) => {
  return jwt.sign({ sub: userId, tokenVersion }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

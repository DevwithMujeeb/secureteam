const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Membership = require("../models/Membership");
const AppError = require("../utils/AppError");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const config = require("../config/env");

// Cookie options shared by anywhere we set the refresh token cookie.
const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production", // only over HTTPS in production
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_REFRESH_EXPIRY default
};

/**
 * POST /api/auth/register
 * Creates a User, an Organization owned by them, and an 'owner' Membership
 * linking the two — all in a single atomic transaction. This is the moment
 * RBAC structure comes into existence for a new account; it must not be
 * possible for a User to exist without an owning Organization.
 */
const register = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      throw new AppError(
        "Name, email, password, and organization name are required",
        400,
      );
    }

    session.startTransaction();

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    const [user] = await User.create([{ name, email, password }], { session });

    const [organization] = await Organization.create(
      [{ name: organizationName, owner: user._id }],
      { session },
    );

    await Membership.create(
      [{ user: user._id, organization: organization._id, role: "owner" }],
      { session },
    );

    await session.commitTransaction();

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      organization: {
        id: organization._id,
        name: organization.name,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/auth/login
 * Verifies credentials and issues a new token pair. Uses a generic error
 * message for both "email not found" and "wrong password" to avoid leaking
 * which one was incorrect (prevents account enumeration). Tracks failed
 * attempts per-account and temporarily locks after repeated failures.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    // Deliberately generic message — don't reveal whether the email exists.
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isLocked()) {
      throw new AppError(
        "Account temporarily locked due to too many failed login attempts. Try again later.",
        423,
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementFailedAttempts();
      throw new AppError("Invalid email or password", 401);
    }

    await user.resetFailedAttempts();

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };

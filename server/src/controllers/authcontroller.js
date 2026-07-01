const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Membership = require("../models/Membership");
const AppError = require("../utils/AppError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const config = require("../config/env");

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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
      user: { id: user._id, name: user.name, email: user.email },
      organization: { id: organization._id, name: organization.name },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");

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

    const membership = await Membership.findOne({ user: user._id }).populate(
      "organization",
    );

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
      organization: membership
        ? {
            id: membership.organization._id,
            name: membership.organization.name,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("No refresh token provided", 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError("User no longer exists", 401);

    if (decoded.tokenVersion !== user.refreshTokenVersion) {
      throw new AppError(
        "Refresh token has been invalidated. Please log in again.",
        401,
      );
    }

    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(
      user._id,
      user.refreshTokenVersion,
    );

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    res
      .status(200)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.sub);
        if (user) {
          user.refreshTokenVersion += 1;
          await user.save();
        }
      } catch {
        // Token already invalid — clear cookie anyway
      }
    }

    res.clearCookie("refreshToken", refreshCookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user and their primary organization.
 * Called on every app load to verify and hydrate session state without
 * requiring a full login — prevents stale org context across accounts.
 */
const me = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
    }).populate("organization");

    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      organization: membership
        ? {
            id: membership.organization._id,
            name: membership.organization.name,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };

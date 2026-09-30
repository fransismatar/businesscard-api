import bcrypt from "bcryptjs";
import User from "../database/models/User.js";
import Card from "../database/models/Card.js";
import AppError from "../error/AppError.js";
import { generateToken } from "./tokenService.js";

const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

type UserInput = Record<string, unknown> & { email?: string; password?: string };

const findUserOrThrow = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const registerUser = async (data: UserInput & { email: string; password: string }) => {
  if (await User.exists({ email: data.email })) {
    throw new AppError(409, "Email already exists");
  }

  const password = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password, isAdmin: false });
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, "Invalid email or password");

  if (user.blockedUntil && user.blockedUntil > new Date()) {
    throw new AppError(403, `Too many failed login attempts. Try again after ${user.blockedUntil.toISOString()}`);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.failedLoginAttempts = 0;
      user.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
    }
    await user.save();
    throw new AppError(401, "Invalid email or password");
  }

  if (user.failedLoginAttempts > 0 || user.blockedUntil) {
    user.failedLoginAttempts = 0;
    user.blockedUntil = null;
    await user.save();
  }

  return generateToken({
    _id: user._id.toString(),
    isBusiness: user.isBusiness,
    isAdmin: user.isAdmin,
  });
};

export const getAllUsers = () => User.find();

export const getUserById = (id: string) => findUserOrThrow(id);

export const updateUser = async (id: string, data: UserInput) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const toggleBusinessStatus = async (id: string) => {
  const user = await findUserOrThrow(id);
  user.isBusiness = !user.isBusiness;
  return user.save();
};

export const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError(404, "User not found");

  await Card.deleteMany({ user_id: user._id });
  await Card.updateMany({ likes: user._id }, { $pull: { likes: user._id } });
  return user;
};

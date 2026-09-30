import mongoose from "mongoose";
import Card from "../database/models/Card.js";
import AppError from "../error/AppError.js";
import { TokenPayload } from "./tokenService.js";

type CardInput = Record<string, unknown>;

const findCardOrThrow = async (id: string) => {
  const card = await Card.findById(id);
  if (!card) throw new AppError(404, "Card not found");
  return card;
};

export const generateBizNumber = async () => {
  while (true) {
    const bizNumber = Math.floor(1000000 + Math.random() * 9000000);
    if (!(await Card.exists({ bizNumber }))) return bizNumber;
  }
};

export const getAllCards = () => Card.find();

export const getMyCards = (userId: string) => Card.find({ user_id: userId });

export const getCardById = (id: string) => findCardOrThrow(id);

export const createCard = async (data: CardInput, userId: string) =>
  Card.create({ ...data, bizNumber: await generateBizNumber(), user_id: userId });

export const updateCard = async (id: string, data: CardInput, userId: string) => {
  const card = await findCardOrThrow(id);
  if (card.user_id.toString() !== userId) {
    throw new AppError(403, "Only the card creator can edit this card");
  }

  card.set(data);
  return card.save();
};

export const toggleLike = async (id: string, userId: string) => {
  const card = await findCardOrThrow(id);
  const index = card.likes.findIndex((like) => like.toString() === userId);

  if (index === -1) {
    card.likes.push(new mongoose.Types.ObjectId(userId));
  } else {
    card.likes.splice(index, 1);
  }
  return card.save();
};

export const deleteCard = async (id: string, user: TokenPayload) => {
  const card = await findCardOrThrow(id);
  if (card.user_id.toString() !== user._id && !user.isAdmin) {
    throw new AppError(403, "Only the card creator or an admin can delete this card");
  }

  await card.deleteOne();
  return card;
};

export const changeBizNumber = async (id: string, bizNumber: number) => {
  const card = await findCardOrThrow(id);
  if (await Card.exists({ bizNumber, _id: { $ne: card._id } })) {
    throw new AppError(409, "bizNumber already belongs to another card");
  }

  card.bizNumber = bizNumber;
  return card.save();
};

import { Router } from "express";
import validate from "../middleware/validate.js";
import { authenticate, requireAdmin, requireBusiness } from "../middleware/auth.js";
import { bizNumberSchema, createCardSchema, updateCardSchema } from "../validations/cardValidation.js";
import * as cardsService from "../services/cardsService.js";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await cardsService.getAllCards());
});

router.get("/my-cards", authenticate, async (req, res) => {
  res.json(await cardsService.getMyCards(req.user!._id));
});

router.patch("/biz-number/:id", authenticate, requireAdmin, validate(bizNumberSchema), async (req, res) => {
  res.json(await cardsService.changeBizNumber(req.params.id as string, req.body.bizNumber));
});

router.get("/:id", async (req, res) => {
  res.json(await cardsService.getCardById(req.params.id));
});

router.post("/", authenticate, requireBusiness, validate(createCardSchema), async (req, res) => {
  res.status(201).json(await cardsService.createCard(req.body, req.user!._id));
});

router.put("/:id", authenticate, validate(updateCardSchema), async (req, res) => {
  res.json(await cardsService.updateCard(req.params.id as string, req.body, req.user!._id));
});

router.patch("/:id", authenticate, async (req, res) => {
  res.json(await cardsService.toggleLike(req.params.id as string, req.user!._id));
});

router.delete("/:id", authenticate, async (req, res) => {
  res.json(await cardsService.deleteCard(req.params.id as string, req.user!));
});

export default router;

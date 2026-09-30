import { Router } from "express";
import validate from "../middleware/validate.js";
import { authenticate, requireAdmin, requireSelf, requireSelfOrAdmin } from "../middleware/auth.js";
import { loginSchema, registerUserSchema, updateUserSchema } from "../validations/userValidation.js";
import * as usersService from "../services/usersService.js";

const router = Router();

router.post("/", validate(registerUserSchema), async (req, res) => {
  const user = await usersService.registerUser(req.body);
  res.status(201).json(user);
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const token = await usersService.loginUser(req.body.email, req.body.password);
  res.json({ token });
});

router.get("/", authenticate, requireAdmin, async (_req, res) => {
  res.json(await usersService.getAllUsers());
});

router.get("/:id", authenticate, requireSelfOrAdmin, async (req, res) => {
  res.json(await usersService.getUserById(req.params.id as string));
});

router.put("/:id", authenticate, requireSelf, validate(updateUserSchema), async (req, res) => {
  res.json(await usersService.updateUser(req.params.id as string, req.body));
});

router.patch("/:id", authenticate, requireSelf, async (req, res) => {
  res.json(await usersService.toggleBusinessStatus(req.params.id as string));
});

router.delete("/:id", authenticate, requireSelfOrAdmin, async (req, res) => {
  res.json(await usersService.deleteUser(req.params.id as string));
});

export default router;

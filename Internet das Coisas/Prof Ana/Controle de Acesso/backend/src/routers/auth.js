import { Router } from "express";
import { login } from "../controller/auth.js";
import { register } from "../controller/register.js";

const router = Router()

router.post("/login", login)
router.post("/register", register)

export default router;
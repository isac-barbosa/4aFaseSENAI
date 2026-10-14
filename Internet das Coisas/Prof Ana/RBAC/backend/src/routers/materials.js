import { Router } from "express";
import { listMaterials, deleteMaterial } from "../controllers/materials.js";
import { listComments, createComment } from "../controllers/comments.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", listMaterials);

router.get("/:id/comments", listComments);
router.post("/:id/comments", createComment);

router.delete("/:id", requireRole("admin"), deleteMaterial);
export default router;

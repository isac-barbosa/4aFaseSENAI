import { Router } from "express";
import { list, deletar } from "../controller/materials.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const routerMaterials = Router()

//Autenticação todas as rotas abaixo exigem token
routerMaterials.use(authenticate);

//Admin e user podm vizualizar
routerMaterials.get("/listar", list);

//Somente admin pode deletar
routerMaterials.delete("/:id", requireRole("admin"), deletar );

export default routerMaterials

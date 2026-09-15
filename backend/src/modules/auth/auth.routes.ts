import { Router } from "express";
import { store } from "../../data/store";

export const authRouter = Router();

/**
 * Autenticacion real (login, JWT, tokens de GitHub) queda preparada pero NO
 * implementada todavia: se hara con un backend independiente que jamas
 * exponga secretos al frontend (Fase 11 del roadmap). Mientras tanto, el
 * frontend simula la sesion eligiendo un usuario de este catalogo.
 */
authRouter.get("/users", (_req, res) => {
  res.json(store.getUsers());
});

authRouter.get("/session", (_req, res) => {
  res.json({
    authenticated: false,
    message: "Autenticacion real pendiente (Fase 11). Selecciona un usuario simulado en la interfaz."
  });
});

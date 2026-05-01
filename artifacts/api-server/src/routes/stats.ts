import { Router } from "express";
import pool from "../lib/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [[membres]]: any = await pool.query("SELECT COUNT(*) as total FROM membre m JOIN utilisateur u ON m.id_util = u.id_util WHERE u.statut = 1");
    const [[coachs]]: any = await pool.query("SELECT COUNT(*) as total FROM coach c JOIN utilisateur u ON c.id_util = u.id_util WHERE u.statut = 1");
    const [[coursWeek]]: any = await pool.query("SELECT COUNT(*) as total FROM cours WHERE statut = 'publie' AND date_cours BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 DAY)");
    const [[abonnementsActifs]]: any = await pool.query("SELECT COUNT(*) as total FROM abonnement WHERE statut = 'actif'");

    res.json({
      membres: membres.total,
      coachs: coachs.total,
      cours_semaine: coursWeek.total,
      abonnements_actifs: abonnementsActifs.total,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

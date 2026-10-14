
export async function listMaterials(req, res) {
  const raw = req.query.search;

  
  if (raw !== undefined && typeof raw !== "string") {
    return res.status(400).json({ message: "Pesquisa invalida." });
  }
  const term = (raw ?? "").trim();
  if (Array.from(term).length > 100) {
    return res.status(400).json({ message: "A pesquisa deve ter no maximo 100 caracteres." });
  }

  if (!term) {
    const [rows] = await req.app.locals.db.execute(
      "SELECT id, name, category FROM materials ORDER BY id"
    );
    return res.json(rows);
  }

  
  const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
  const [rows] = await req.app.locals.db.execute(
    "SELECT id, name, category FROM materials WHERE name LIKE ? OR category LIKE ? ORDER BY id",
    [pattern, pattern]
  );
  res.json(rows);
}


export async function deleteMaterial(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID invalido." });
  }

  const [result] = await req.app.locals.db.execute(
    "DELETE FROM materials WHERE id = ?",
    [id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Material nao encontrado." });
  }

  
  await req.app.locals.db.execute("DELETE FROM comments WHERE material_id = ?", [id]);

  
  res.status(204).end();
}

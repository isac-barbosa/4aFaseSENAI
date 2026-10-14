const MAX_COMMENT_LENGTH = 500;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function parseMaterialId(req) {
  const id = Number(req.params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function materialExists(db, id) {
  const [rows] = await db.execute("SELECT id FROM materials WHERE id = ?", [id]);
  return rows.length > 0;
}


export async function listComments(req, res) {
  const materialId = parseMaterialId(req);
  if (!materialId) return res.status(400).json({ message: "ID invalido." });

  const db = req.app.locals.db;
  if (!(await materialExists(db, materialId))) {
    return res.status(404).json({ message: "Material nao encontrado." });
  }

  const [rows] = await db.execute(
    `SELECT c.id, c.content, c.created_at, u.name AS author
       FROM comments c JOIN users u ON u.id = c.user_id
      WHERE c.material_id = ?
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT 200`,
    [materialId]
  );
  res.json(rows);
}


export async function createComment(req, res) {
  const materialId = parseMaterialId(req);
  if (!materialId) return res.status(400).json({ message: "ID invalido." });

  const { content } = req.body || {};

  
  if (typeof content !== "string") {
    return res.status(400).json({ message: "O comentario deve ser um texto." });
  }
  const text = content.replace(/\r\n/g, "\n").trim();
  const length = Array.from(text).length;
  if (length < 1 || length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({
      message: `O comentario deve ter entre 1 e ${MAX_COMMENT_LENGTH} caracteres.`,
    });
  }
  if (CONTROL_CHARS.test(text)) {
    return res.status(400).json({ message: "O comentario contem caracteres invalidos." });
  }

  const db = req.app.locals.db;
  if (!(await materialExists(db, materialId))) {
    return res.status(404).json({ message: "Material nao encontrado." });
  }

  
  const [result] = await db.execute(
    "INSERT INTO comments (material_id, user_id, content) VALUES (?, ?, ?)",
    [materialId, Number(req.user.sub), text]
  );

  const [rows] = await db.execute(
    `SELECT c.id, c.content, c.created_at, u.name AS author
       FROM comments c JOIN users u ON u.id = c.user_id
      WHERE c.id = ?`,
    [result.insertId]
  );
  res.status(201).json(rows[0]);
}

import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql2.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "root",
    database: process.env.DB_NAME || "desi_20251",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

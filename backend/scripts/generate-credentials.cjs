#!/usr/bin/env node
/**
 * Genera backend/src/data/mock/credentials.json con hashes bcrypt.
 *
 * Password por defecto para el equipo interno y clientes demo (Alpha/Beta/Gamma):
 *   "automation2026"
 * Password real de Zerimar (la que se le entrego a la empresa):
 *   "zerimaradmin"
 *
 * Re-ejecutar este script regenera el archivo completo (no acumula duplicados).
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const OUT_FILE = path.join(__dirname, "..", "src", "data", "mock", "credentials.json");
const usersFile = path.join(__dirname, "..", "src", "data", "mock", "users.json");
const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

const INTERNAL_DEFAULT_PASSWORD = "automation2026";
const PASSWORD_OVERRIDES = {
  "zerimarsoftware@automationsolutions.org": "zerimaradmin"
};

const SALT_ROUNDS = 10;

const credentials = users.map((user) => {
  const password = PASSWORD_OVERRIDES[user.email] || INTERNAL_DEFAULT_PASSWORD;
  return {
    userId: user.id,
    email: user.email,
    passwordHash: bcrypt.hashSync(password, SALT_ROUNDS)
  };
});

fs.writeFileSync(OUT_FILE, JSON.stringify(credentials, null, 2), "utf8");
console.log(`Credenciales generadas en ${OUT_FILE} (${credentials.length} usuarios)`);

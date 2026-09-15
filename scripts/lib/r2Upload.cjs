// Sube el contenido de una carpeta de evidencias a Cloudflare R2 (API S3-compatible).
// Se usa desde run-with-evidences.cjs para que las corridas de CI (GitHub Actions,
// donde el disco es efimero) dejen sus evidencias en un storage persistente que
// el backend del dashboard puede leer despues, aunque el runner ya no exista.
//
// No hace nada (retorna sin error) si faltan credenciales de R2, para no romper
// el flujo local donde nadie configuro estas variables.

const fs = require("fs");
const path = require("path");

function r2ConfigFromEnv() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`
  };
}

function walkFiles(rootDir) {
  const files = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".zip": "application/zip",
    ".txt": "text/plain; charset=utf-8",
    ".log": "text/plain; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Sube recursivamente `localDir` a R2 bajo el prefijo `bucketPrefix`.
 * Retorna true si subio (o intento subir) algo, false si no habia credenciales.
 */
async function uploadDirToR2({ localDir, bucketPrefix }) {
  const config = r2ConfigFromEnv();
  if (!config) {
    console.log("[r2] Variables R2_* no configuradas, se omite la subida de evidencias.");
    return false;
  }
  if (!fs.existsSync(localDir)) {
    console.warn(`[r2] No existe la carpeta a subir: ${localDir}`);
    return false;
  }

  let S3Client, PutObjectCommand;
  try {
    ({ S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"));
  } catch (err) {
    console.warn("[r2] @aws-sdk/client-s3 no esta instalado, se omite la subida.", err.message);
    return false;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });

  const files = walkFiles(localDir);
  console.log(`[r2] Subiendo ${files.length} archivo(s) a r2://${config.bucket}/${bucketPrefix} ...`);

  let uploaded = 0;
  for (const filePath of files) {
    const relative = path.relative(localDir, filePath).split(path.sep).join("/");
    const key = `${bucketPrefix}/${relative}`;
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: fs.readFileSync(filePath),
          ContentType: guessContentType(filePath)
        })
      );
      uploaded++;
    } catch (err) {
      console.warn(`[r2] Error subiendo ${key}:`, err.message);
    }
  }

  console.log(`[r2] Listo: ${uploaded}/${files.length} archivo(s) subidos.`);
  return true;
}

module.exports = { uploadDirToR2, r2ConfigFromEnv };

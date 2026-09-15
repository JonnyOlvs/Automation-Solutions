import { S3Client, ListObjectsV2Command, GetObjectCommand, _Object } from "@aws-sdk/client-s3";

/**
 * Cliente de solo lectura hacia el bucket de Cloudflare R2 donde
 * `scripts/run-with-evidences.cjs` sube las evidencias de las corridas de CI
 * (ver `scripts/lib/r2Upload.cjs`). Se usa desde `ciEvidenceBridge.ts` para que
 * el backend desplegado (sin disco persistente) pueda ver esas corridas.
 *
 * Si no hay credenciales configuradas, todas las funciones devuelven vacio
 * silenciosamente: el dashboard sigue funcionando solo con datos mock/locales.
 */

export interface R2Config {
  bucket: string;
  endpoint: string;
  publicBaseUrl: string;
}

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null | undefined;

export function getR2Config(): R2Config | null {
  if (cachedConfig !== undefined) return cachedConfig;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    cachedConfig = null;
    return null;
  }

  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  cachedConfig = { bucket, endpoint, publicBaseUrl };
  return cachedConfig;
}

function getClient(): S3Client | null {
  const config = getR2Config();
  if (!config) return null;
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string
    }
  });
  return cachedClient;
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

/** Lista todas las keys bajo un prefijo (maneja paginacion). */
export async function listKeys(prefix: string): Promise<string[]> {
  const client = getClient();
  const config = getR2Config();
  if (!client || !config) return [];

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    );
    for (const obj of (response.Contents ?? []) as _Object[]) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

export async function getObjectText(key: string): Promise<string | null> {
  const client = getClient();
  const config = getR2Config();
  if (!client || !config) return null;

  try {
    const response = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
    const body = await response.Body?.transformToString("utf-8");
    return body ?? null;
  } catch {
    return null;
  }
}

/** URL publica de una key, asumiendo un dominio propio conectado al bucket de R2. */
export function toPublicUrl(key: string): string {
  const config = getR2Config();
  if (!config || !config.publicBaseUrl) return key;
  return `${config.publicBaseUrl}/${key}`;
}

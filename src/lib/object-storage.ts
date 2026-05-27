import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

export type ObjectStorageConfig = {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
};

let client: S3Client | null = null;
let bucketReady: Promise<boolean> | null = null;

export function getObjectStorageConfig(): ObjectStorageConfig | null {
  const endpoint =
    process.env.S3_ENDPOINT?.trim() || process.env.MINIO_ENDPOINT?.trim();
  const accessKey =
    process.env.S3_ACCESS_KEY?.trim() || process.env.MINIO_ROOT_USER?.trim();
  const secretKey =
    process.env.S3_SECRET_KEY?.trim() || process.env.MINIO_ROOT_PASSWORD?.trim();
  const bucket =
    process.env.S3_BUCKET?.trim() || process.env.MINIO_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim() || "us-east-1";

  if (!endpoint || !accessKey || !secretKey || !bucket) return null;
  return { endpoint, accessKey, secretKey, bucket, region };
}

export function isObjectStorageEnabled(): boolean {
  return getObjectStorageConfig() !== null;
}

function getClient(): S3Client {
  const cfg = getObjectStorageConfig();
  if (!cfg) throw new Error("Object storage não configurado.");
  if (!client) {
    client = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKey,
        secretAccessKey: cfg.secretKey,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

async function ensureBucket(): Promise<boolean> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return false;

  if (!bucketReady) {
    bucketReady = (async () => {
      const s3 = getClient();
      try {
        await s3.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
        return true;
      } catch {
        try {
          await s3.send(new CreateBucketCommand({ Bucket: cfg.bucket }));
          return true;
        } catch {
          return false;
        }
      }
    })();
  }
  return bucketReady;
}

export async function checkObjectStorageReady(): Promise<boolean> {
  if (!isObjectStorageEnabled()) return false;
  return ensureBucket();
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const cfg = getObjectStorageConfig();
  if (!cfg) throw new Error("S3 não configurado.");
  await ensureBucket();
  await getClient().send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key.replace(/\\/g, "/"),
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getObject(key: string): Promise<Buffer | null> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return null;
  try {
    const res = await getClient().send(
      new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key.replace(/\\/g, "/"),
      }),
    );
    if (!res.Body) return null;
    const bytes = await res.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch {
    return null;
  }
}

export async function getObjectRange(
  key: string,
  start: number,
  end: number,
): Promise<{ data: Buffer; size: number; contentType: string } | null> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return null;
  try {
    const res = await getClient().send(
      new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key.replace(/\\/g, "/"),
        Range: `bytes=${start}-${end}`,
      }),
    );
    if (!res.Body) return null;
    const bytes = await res.Body.transformToByteArray();
    const size =
      res.ContentLength ??
      (res.ContentRange
        ? parseInt(res.ContentRange.split("/")[1] ?? "0", 10)
        : 0);
    return {
      data: Buffer.from(bytes),
      size,
      contentType: res.ContentType ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function headObject(
  key: string,
): Promise<{ size: number; contentType: string } | null> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return null;
  try {
    const res = await getClient().send(
      new HeadObjectCommand({
        Bucket: cfg.bucket,
        Key: key.replace(/\\/g, "/"),
      }),
    );
    return {
      size: res.ContentLength ?? 0,
      contentType: res.ContentType ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return;
  try {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: cfg.bucket,
        Key: key.replace(/\\/g, "/"),
      }),
    );
  } catch {
    /* já removido */
  }
}

export async function listObjectStorageStats(): Promise<{
  files: number;
  bytes: number;
}> {
  const cfg = getObjectStorageConfig();
  if (!cfg) return { files: 0, bytes: 0 };

  let files = 0;
  let bytes = 0;
  let token: string | undefined;

  do {
    const res = await getClient().send(
      new ListObjectsV2Command({
        Bucket: cfg.bucket,
        ContinuationToken: token,
      }),
    );
    for (const obj of res.Contents ?? []) {
      files += 1;
      bytes += obj.Size ?? 0;
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return { files, bytes };
}

/** Sincroniza pasta HLS gerada localmente para o bucket S3. */
export async function uploadLocalDirectoryToObjectStorage(
  localDir: string,
  s3Prefix: string,
): Promise<void> {
  const prefix = s3Prefix.replace(/\\/g, "/").replace(/\/$/, "");

  async function walk(dir: string, rel: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const localPath = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(localPath, relPath);
      } else if (entry.isFile()) {
        const buf = await readFile(localPath);
        const key = `${prefix}/${relPath}`;
        const ext = path.extname(entry.name).toLowerCase();
        const mime =
          ext === ".m3u8"
            ? "application/vnd.apple.mpegurl"
            : ext === ".ts"
              ? "video/mp2t"
              : "application/octet-stream";
        await putObject(key, buf, mime);
      }
    }
  }

  const st = await stat(localDir).catch(() => null);
  if (!st?.isDirectory()) return;
  await walk(localDir, "");
}

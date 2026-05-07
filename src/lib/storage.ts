import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// ===== 接口定义 =====

export interface StoredFile {
  url: string;       // 对外访问 URL
  path: string;      // 内部存储路径
}

export interface FileStorage {
  save(file: File, subDir?: string): Promise<StoredFile>;
  delete(path: string): Promise<void>;
}

// ===== 本地存储实现 =====

class LocalFileStorage implements FileStorage {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = join(process.cwd(), 'public', 'uploads');
    this.baseUrl = '/uploads';
  }

  async save(file: File, subDir = 'images'): Promise<StoredFile> {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(this.baseDir, subDir);
    const relativePath = `${subDir}/${filename}`;

    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(this.baseDir, relativePath), buffer);

    return { url: `${this.baseUrl}/${relativePath}`, path: relativePath };
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.baseDir, path);
    await unlink(fullPath).catch(() => {});
  }
}

// ===== 云存储实现（S3 兼容） =====

// 使用前需安装: npm install @aws-sdk/client-s3
// 配置环境变量:
//   STORAGE_TYPE=s3
//   S3_REGION=oss-cn-hangzhou
//   S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
//   S3_BUCKET=fraud-cases
//   S3_ACCESS_KEY_ID=xxx
//   S3_SECRET_ACCESS_KEY=xxx
//   S3_PUBLIC_URL=https://fraud-cases.oss-cn-hangzhou.aliyuncs.com

class S3FileStorage implements FileStorage {
  private s3Client: any = null;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || '';
    this.publicUrl = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '');
  }

  private async getClient(): Promise<any> {
    if (this.s3Client) return this.s3Client;
    const { S3Client } = await import('@aws-sdk/client-s3');
    this.s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    });
    return this.s3Client;
  }

  async save(file: File, subDir = 'images'): Promise<StoredFile> {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const key = `${subDir}/${filename}`;

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    return { url: `${this.publicUrl}/${key}`, path: key };
  }

  async delete(path: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();
    await client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    }));
  }
}

// ===== 工厂函数 =====

let storageInstance: FileStorage | null = null;

export function getStorage(): FileStorage {
  if (storageInstance) return storageInstance;

  const type = process.env.STORAGE_TYPE || 'local';

  if (type === 's3') {
    storageInstance = new S3FileStorage();
  } else {
    storageInstance = new LocalFileStorage();
  }

  return storageInstance;
}

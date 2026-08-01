import fs from 'fs';
import path from 'path';

export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(filePath: string): Promise<boolean>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(__dirname, '../../../uploads/avatars');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, _mimeType: string): Promise<string> {
    const uniqueName = `${Date.now()}-${fileName}`;
    const destination = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(destination, fileBuffer);
    return `/uploads/avatars/${uniqueName}`;
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(__dirname, '../../../', relativePath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (_err) {
      return false;
    }
  }
}

export const storageService = new LocalStorageService();

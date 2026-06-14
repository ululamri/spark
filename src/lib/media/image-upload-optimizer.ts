export type ImageUploadPurpose = 'avatar' | 'community';

const JPEG_TYPES = new Set(['image/jpeg', 'image/jpg']);
const LOSSY_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function extensionForMime(mimeType: string) {
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/png') return 'png';
  return 'jpg';
}

function replaceExtension(fileName: string, mimeType: string) {
  const extension = extensionForMime(mimeType);
  const safeName = fileName.trim() || `spark-upload.${extension}`;
  return safeName.includes('.') ? safeName.replace(/\.[^.]+$/, `.${extension}`) : `${safeName}.${extension}`;
}

function targetMimeType(sourceType: string) {
  if (typeof document === 'undefined') return sourceType || 'image/jpeg';
  const canvas = document.createElement('canvas');
  const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  if (supportsWebp && LOSSY_TYPES.has(sourceType)) return 'image/webp';
  if (JPEG_TYPES.has(sourceType)) return 'image/jpeg';
  return sourceType || 'image/jpeg';
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar belum bisa dibaca untuk optimasi.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Gambar belum bisa dikompresi.'));
      },
      mimeType,
      quality
    );
  });
}

function optionsForPurpose(purpose: ImageUploadPurpose) {
  if (purpose === 'avatar') return { maxSide: 640, quality: 0.82, maxBytes: 240 * 1024 };
  return { maxSide: 1920, quality: 0.84, maxBytes: 1_600 * 1024 };
}

export async function optimizeImageFileForUpload(file: File, purpose: ImageUploadPurpose): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  const image = await loadImage(file);
  const { maxSide, quality, maxBytes } = optionsForPurpose(purpose);
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return file;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  const mimeType = targetMimeType(file.type);
  let blob = await canvasToBlob(canvas, mimeType, quality);

  if (blob.size > maxBytes) {
    blob = await canvasToBlob(canvas, mimeType, purpose === 'avatar' ? 0.74 : 0.76);
  }
  if (blob.size > maxBytes) {
    blob = await canvasToBlob(canvas, mimeType, purpose === 'avatar' ? 0.66 : 0.68);
  }

  if (blob.size >= file.size && file.size <= maxBytes) return file;

  return new File([blob], replaceExtension(file.name, mimeType), {
    type: mimeType,
    lastModified: Date.now()
  });
}

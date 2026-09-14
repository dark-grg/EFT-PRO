/**
 * Client-side Image Compression Utility for Formation Screenshots
 * Supports JPG, JPEG, PNG, WEBP
 * Resizes large dimensions to max 1280px and applies high-efficiency compression
 * Pure client-side canvas without external SDKs or Firebase storage
 */

export interface CompressedImageResult {
  base64: string;      // Base64 string suitable for API transmission
  dataUrl: string;     // Data URL suitable for img src preview
  width: number;
  height: number;
  originalSizeKb: number;
  compressedSizeKb: number;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 2048;
const COMPRESSION_QUALITY = 0.95;

export async function compressImageFile(file: File): Promise<CompressedImageResult> {
  if (!file) {
    throw new Error('لم يتم تحديد أي ملف.');
  }

  const fileType = (file.type || '').toLowerCase();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  const isSupported =
    SUPPORTED_TYPES.includes(fileType) ||
    ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);

  if (!isSupported) {
    throw new Error('صيغة الملف غير مدعومة. يرجى رفع صورة بصيغة JPG, PNG أو WEBP.');
  }

  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ملف الصورة تالف أو غير قابل للعرض.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down if either dimension exceeds MAX_DIMENSION
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('فشل تهيئة معالج الرسوم في المتصفح.');
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as image/jpeg or image/webp
          const outputMime = 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputMime, COMPRESSION_QUALITY);
          const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          const compressedSizeKb = Math.round((base64.length * 0.75) / 1024);

          resolve({
            base64,
            dataUrl,
            width,
            height,
            originalSizeKb,
            compressedSizeKb
          });
        } catch (err: any) {
          reject(new Error(err?.message || 'تعذر ضغط الصورة.'));
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

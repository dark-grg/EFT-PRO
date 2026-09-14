/**
 * FormationScannerBridge handles integration with Android Native (Capacitor / WebView JavaScriptInterface)
 * and provides full standard Web Photo Picker fallback.
 */

export interface ProcessedImageResult {
  base64: string;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  fileSizeKB: number;
  fileName: string;
}

export class FormationScannerBridge {
  private static instance: FormationScannerBridge;

  public static getInstance(): FormationScannerBridge {
    if (!FormationScannerBridge.instance) {
      FormationScannerBridge.instance = new FormationScannerBridge();
    }
    return FormationScannerBridge.instance;
  }

  /**
   * Checks if running inside an Android WebView or Capacitor native wrapper
   */
  public isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.AndroidFormationScanner || win.Android || win.Capacitor?.isNativePlatform());
  }

  /**
   * Prompts the user to pick a screenshot from Android Photo Picker or File System
   */
  public async pickImage(): Promise<File | null> {
    return new Promise((resolve) => {
      // Create hidden file input element with Android-compatible accept types
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp,image/jpg';
      input.multiple = false;
      input.style.display = 'none';

      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0] || null;
        document.body.removeChild(input);
        resolve(file);
      };

      // Handle cancel event
      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Preprocesses image:
   * - Resizes to max dimensions (maintaining aspect ratio so names/ratings stay sharp)
   * - Compresses to JPEG 85% quality
   * - Removes heavy metadata
   */
  public async preprocessImage(file: File, maxDimension: number = 1280): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        let width = originalWidth;
        let height = originalHeight;

        // Calculate aspect-ratio scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('تعذر إنشاء سياق معالجة الصورة.'));
          return;
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.85 quality for crisp text recognition
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        const approxSizeKB = Math.round((base64.length * (3 / 4)) / 1024);

        resolve({
          base64,
          originalWidth,
          originalHeight,
          processedWidth: width,
          processedHeight: height,
          fileSizeKB: approxSizeKB,
          fileName: file.name
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('تعذر قراءة ملف الصورة المحدد. يرجى اختيار ملف صورة صالح.'));
      };

      img.src = objectUrl;
    });
  }
}

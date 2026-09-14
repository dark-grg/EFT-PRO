import { FormationScannerBridge, ProcessedImageResult } from '../native/FormationScannerBridge';

export class FormationScannerService {
  private bridge: FormationScannerBridge;

  constructor() {
    this.bridge = FormationScannerBridge.getInstance();
  }

  /**
   * Opens photo picker and prepares image for vision analysis
   */
  public async selectAndPrepareImage(): Promise<ProcessedImageResult | null> {
    const file = await this.bridge.pickImage();
    if (!file) return null;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
    }

    // Process and compress image
    return await this.bridge.preprocessImage(file, 1280);
  }

  /**
   * Prepares a selected File object directly (e.g. from drag & drop or input onchange)
   */
  public async prepareFile(file: File): Promise<ProcessedImageResult> {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
    }
    return await this.bridge.preprocessImage(file, 1280);
  }
}

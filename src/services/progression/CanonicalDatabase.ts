import { EF_LABO_PROVIDER, EFLabCardRecord } from './EFLabProgressionProvider';

export type EfootbaseCardRecord = EFLabCardRecord;

export class CanonicalProgressionDatabase {
  static getProgressions(): EFLabCardRecord[] {
    return EF_LABO_PROVIDER.getAllRecords();
  }

  static getProgressionForCard(cardId: string | number): EFLabCardRecord | null {
    if (!cardId) return null;
    return EF_LABO_PROVIDER.getCardRecord(String(cardId));
  }

  static getDataVersion(): string {
    return 'ef-labo-v1.0';
  }

  static clearAll() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('EFT_EFOOTBALL_LABO_RECORDS');
      localStorage.setItem('EFT_CLEAR_PROGRESSIONS', 'true');
    }
  }

  static setRecords(records: Record<string, EFLabCardRecord> | EFLabCardRecord[]) {
    if (Array.isArray(records)) {
      EF_LABO_PROVIDER.parseImportedData(records);
    } else {
      EF_LABO_PROVIDER.saveStoredRecords(records);
    }
  }

  static addRecord(record: EFLabCardRecord) {
    EF_LABO_PROVIDER.addOrUpdateRecord(record);
  }

  static addRecords(records: EFLabCardRecord[]) {
    for (const r of records) {
      EF_LABO_PROVIDER.addOrUpdateRecord(r);
    }
  }
}

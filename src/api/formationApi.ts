import { apiClient } from './client';
import { safeLocalStorage } from '../storage/localStorage';

export interface DetectedPlayer {
  name: string;
  position: string;
  rating?: number | null;
  isClear?: boolean;
  confidence?: number;
  pitchX?: number;
  pitchY?: number;
}

export interface FormationAnalysisResult {
  isFormationScreenshot: boolean;
  isReliable: boolean;
  unreliableReason?: string;
  gameName?: string;
  formationName?: string;
  coachName?: string;
  playstyle?: string;
  teamStrength?: string;
  tacticalRating?: number;
  strengths: string[];
  weaknesses: string[];
  tacticalAdvice: string[];
  detectedPlayers?: DetectedPlayer[];
}

export const formationApi = {
  async analyzeFormation(base64Image: string): Promise<FormationAnalysisResult> {
    const deviceId = safeLocalStorage.getDeviceId();

    const result = await apiClient.post<FormationAnalysisResult>(
      '/api/analyze-formation',
      {
        image: base64Image,
        deviceId
      },
      45000 // 45s timeout for Gemini Vision processing
    );

    if (import.meta.env.DEV) {
      console.log('FORMATION API RESPONSE:', {
        endpoint: '/api/analyze-formation',
        responseKeys: Object.keys(result),
        isFormationScreenshot: result.isFormationScreenshot,
        isReliable: result.isReliable,
        detectedPlayersCount: result.detectedPlayers?.length || 0,
        formationName: result.formationName,
        tacticalRating: result.tacticalRating,
      });
    }

    return result;
  }
};

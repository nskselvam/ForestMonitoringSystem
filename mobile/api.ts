import axios from 'axios';
import { API_ENDPOINTS } from './config';
import { AnalysisRequest, AnalysisResponse } from './types';

// API Service
export const forestWatchAPI = {
  // Run analysis
  runAnalysis: async (request: AnalysisRequest): Promise<AnalysisResponse> => {
    try {
      const response = await axios.post<AnalysisResponse>(
        API_ENDPOINTS.runAnalysis,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};

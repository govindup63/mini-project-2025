export interface LocationData {
  lat: number;
  lon: number;
  display_name: string;
}

export interface SolarData {
  solarData: number[];
  average: number;
  fluid: string;
  location: string;
}

export interface ApiResponse {
  success: boolean;
  data?: SolarData;
  error?: string;
}
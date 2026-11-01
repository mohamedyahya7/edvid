import * as Device from "expo-device";
import axiosInstance from "./Axios";

export interface Resolution {
  quality: string;
  size_in_mb: string;
}
export interface VideoDetails {
  id: any;
  title: string;
  description: string;
  thumbnail: string;
  teacher_name: string;
  teacher_image: string;
}

interface ActivationSuccessResponse {
  video: VideoDetails;
  resolutions: Resolution[];
}

interface DownloadLinksSuccessResponse {
  video: string;
  url: string;
  video_id: string;
  video_title: string;
  audio_url?: string;
  subtitle_url?: string;
  expires_at?: number | null; // Expiry in days
}

interface ErrorResponse {
  success: false;
  message: string;
}

type ActivationResponse = ActivationSuccessResponse | ErrorResponse;
type DownloadLinksResponse = DownloadLinksSuccessResponse | ErrorResponse;

const deviceId = Device.osInternalBuildId;

const checkActivationCode = async (
  code: string
): Promise<ActivationResponse> => {
  if (!deviceId) {
    return {
      success: false,
      message: "Could not retrieve device identifier.",
    };
  }
  try {
    const response = await axiosInstance.post("/validate-code", {
      code,
      device_id: deviceId,
    });
    console.log("response ", response);
    return response.data;
  } catch (error: any) {
    console.error("Error in checkActivationCode:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "A network error occurred. Please try again.",
    };
  }
};

const requestDownloadLinks = async (
  code: string,
  resolution: string,
  access_type: "watch" | "download"
): Promise<DownloadLinksResponse> => {
  try {
    const response = await axiosInstance.post("/videos/request-download", {
      code,
      resolution,
      device_id: deviceId,
      access_type,
    });
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error in requestDownloadLinks:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "A network error occurred. Please try again.",
    };
  }
};

const notifyDownloadComplete = async (code: string) => {
  try {
    const response = await axiosInstance.post("/downloads/complete", {
      code,
      device_id: deviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to notify server of download completion:", error);
    return null;
  }
};

const notifyDownloadFailed = async (code: string) => {
  try {
    const response = await axiosInstance.post("/downloads/failed", {
      code,
      device_id: deviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to notify server of download failure:", error);
    return null;
  }
};

const notifyDownloadCanceled = async (code: string) => {
  try {
    const response = await axiosInstance.post("/codes/cancel", {
      code,
      device_id: deviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to notify server of download cancellation:", error);
    return null;
  }
};

export const ActivationService = {
  checkActivationCode,
  requestDownloadLinks,
  notifyDownloadComplete,
  notifyDownloadFailed,
  notifyDownloadCanceled,
};

export default {};

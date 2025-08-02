import * as Device from "expo-device";

const API_BASE_URL = "http://192.168.1.15:8000/api/v1"; // Please replace with your actual API base URL

export interface Resolution {
  quality: string;
  size_in_mb: string;
}
export interface VideoDetails {
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
  url: string;
  video_id: string;
  video_title: string;
  audio_url?: string;
  subtitle_url?: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

type ActivationResponse = ActivationSuccessResponse | ErrorResponse;
type DownloadLinksResponse = DownloadLinksSuccessResponse | ErrorResponse;

const deviceId = Device.osInternalBuildId; // Using a stable device identifier
const checkActivationCode = async (
  code: string
): Promise<ActivationResponse> => {
  console.log(deviceId);
  console.log(code);
  if (!deviceId) {
    return {
      success: false,
      message: "Could not retrieve device identifier.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/validate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, device_id: deviceId }),
    });

    if (!response.ok) {
      // Handle non-2xx responses
      const errorData: ErrorResponse = await response.json();
      return {
        success: false,
        message:
          errorData.message || "An error occurred while checking the code.",
      };
    }

    const data: ActivationSuccessResponse = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Network or parsing error in checkActivationCode:", error);
    return {
      success: false,
      message: "A network error occurred. Please try again.",
    };
  }
};

const requestDownloadLinks = async (
  code: string,
  resolution: string
): Promise<DownloadLinksResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/request-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, resolution, device_id: deviceId }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      return {
        success: false,
        message:
          errorData.message ||
          "An error occurred while fetching download links.",
      };
    }

    const data: DownloadLinksSuccessResponse = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Network or parsing error in requestDownloadLinks:", error);
    return {
      success: false,
      message: "A network error occurred. Please try again.",
    };
  }
};

export const ActivationService = {
  checkActivationCode,
  requestDownloadLinks,
};

export default {};

import axiosInstance from "./Axios";

export const CatalogService = {
  async fetchCatalog(gradeId: string) {
    try {
      const response = await axiosInstance.get("/catalog", {
        params: { "grade-id": gradeId },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      throw error;
    }
  },

  async likeVideo(videoId: string, like: boolean): Promise<boolean> {
    try {
      // Assuming the API endpoint is /videos/{videoId}/like
      await axiosInstance.post(`/videos/like`, { video_id: videoId, like });
      console.log(
        `[CatalogService] Video ${videoId} ${like ? "liked" : "unliked"}`
      );
      return true;
    } catch (error) {
      console.error(
        `[CatalogService] Failed to ${
          like ? "like" : "unlike"
        } video ${videoId}:`,
        error
      );
      return false;
    }
  },

  async followTeacher(teacherId: string, follow: boolean): Promise<boolean> {
    try {
      // Assuming the API endpoint is /teachers/{teacherId}/follow
      await axiosInstance.post(`/teachers/follow`, {
        teacher_id: teacherId,
        follow,
      });
      console.log(
        `[CatalogService] Teacher ${teacherId} ${
          follow ? "followed" : "unfollowed"
        }`
      );
      return true;
    } catch (error) {
      console.error(
        `[CatalogService] Failed to ${
          follow ? "follow" : "unfollow"
        } teacher ${teacherId}:`,
        error
      );
      return false;
    }
  },
};

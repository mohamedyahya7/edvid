import axiosInstance from "./Axios";

export type Grade = {
  id: number;
  name: string;
};

export const GradeService = {
  async fetchGrades() {
    try {
      const response = await axiosInstance.get("/grades");
      return response.data.grades;
    } catch (error) {
      console.error("Failed to fetch grades:", error);
      throw error;
    }
  },
};

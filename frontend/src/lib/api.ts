import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const applicationsApi = {
  getApplications: async (userId: string) => {
    const res = await api.get(`/applications/user/${userId}`);
    return res.data;
  },
  apply: async (applicantId: string, jobId: string) => {
    const res = await api.post(`/applications/?applicant_id=${applicantId}&job_id=${jobId}`);
    return res.data;
  },
};

export const resumeApi = {
  processResume: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    
    const res = await api.post("/resumes/process-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  getProfile: async (userId: string) => {
    const res = await api.get(`/resumes/profile/${userId}`);
    return res.data;
  },
};

export const jobsApi = {
  createJob: async (jobData: { title: string; company: string; description: string; requirements: string[] | null }, posterId: string) => {
    const res = await api.post(`/jobs/?poster_id=${posterId}`, jobData);
    return res.data;
  },
  matchCandidates: async (jobId: string, limit: number = 5) => {
    const res = await api.post(`/jobs/${jobId}/match?limit=${limit}`);
    return res.data;
  },
  listJobs: async () => {
    const res = await api.get("/jobs/");
    return res.data;
  },
  getJob: async (jobId: string) => {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  },
};

export const usersApi = {
  getUser: async (userId: string) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },
  createUser: async (userData: any) => {
    const res = await api.post("/users/", userData);
    return res.data;
  },
};

import { useMutation, useQuery } from "@tanstack/react-query";
import { resumeApi, jobsApi, applicationsApi, usersApi } from "@/lib/api";

export function useProcessResume() {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      resumeApi.processResume(userId, file),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
    retry: false, // Don't retry if user not found, so we can handle creation
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (userData: any) => usersApi.createUser(userData),
  });
}

export function useCreateJob() {
  return useMutation({
    mutationFn: ({ payload, posterId }: { payload: { title: string; company: string; description: string; requirements: string[] | null }; posterId: string }) =>
      jobsApi.createJob(payload, posterId),
  });
}

export function useMatchCandidates() {
  return useMutation({
    mutationFn: ({ jobId, limit }: { jobId: string; limit?: number }) =>
      jobsApi.matchCandidates(jobId, limit),
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => resumeApi.getProfile(userId),
    enabled: !!userId,
    retry: false,
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: jobsApi.listJobs,
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.getJob(jobId),
    enabled: !!jobId,
    retry: false,
  });
}

export function useApplications(userId: string) {
  return useQuery({
    queryKey: ["applications", userId],
    queryFn: () => applicationsApi.getApplications(userId),
    enabled: !!userId,
    retry: false,
  });
}

export function useApply() {
  return useMutation({
    mutationFn: ({ applicantId, jobId }: { applicantId: string; jobId: string }) =>
      applicationsApi.apply(applicantId, jobId),
  });
}

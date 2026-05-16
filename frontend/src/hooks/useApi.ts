import { useMutation, useQuery } from "@tanstack/react-query";
import { resumeApi, jobsApi, applicationsApi } from "@/lib/api";

export function useProcessResume() {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      resumeApi.processResume(userId, file),
  });
}

export function useCreateJob() {
  return useMutation({
    mutationFn: ({ payload, posterId }: { payload: { title: string; company: string; description: string; requirements: string[] }; posterId: string }) =>
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
  });
}

export function useApplications(userId: string) {
  return useQuery({
    queryKey: ["applications", userId],
    queryFn: () => applicationsApi.getApplications(userId),
    enabled: !!userId,
  });
}

export function useApply() {
  return useMutation({
    mutationFn: ({ applicantId, jobId }: { applicantId: string; jobId: string }) =>
      applicationsApi.apply(applicantId, jobId),
  });
}

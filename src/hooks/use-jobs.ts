import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getBackendUrl } from "@/lib/api";
import { CreateJobInput } from "@/lib/types";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await api.jobs.list();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!getBackendUrl(),
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
}

export function useJob(id: number | null) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await api.jobs.get(id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id && !!getBackendUrl(),
    refetchInterval: (query) => {
      // Poll faster while job is in progress
      const job = query.state.data;
      if (job?.status === "pending" || job?.status === "processing") {
        return 2000;
      }
      return false;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateJobInput) => {
      const { data, error } = await api.jobs.create(input);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

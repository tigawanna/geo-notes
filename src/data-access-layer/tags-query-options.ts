import type { TTag } from "@/lib/drizzle/schema";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tagsApi from "./tags-api";

export const tagsQueryOptions = queryOptions({
  queryKey: ["tags"],
  queryFn: async () => {
    const tags = await tagsApi.getTags();
    return tags;
  },
});

export const tagQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["tags", id],
    queryFn: async () => {
      const tag = await tagsApi.getTagById(id);
      return tag;
    },
  });

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tag: Omit<TTag, "id" | "created">) => {
      return await tagsApi.createTag(tag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<TTag, "id" | "created">> }) => {
      await tagsApi.updateTag(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await tagsApi.deleteTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

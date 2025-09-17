import { db } from "@/lib/drizzle/client";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { is } from "drizzle-orm";
import { isSingleStoreSchema } from "drizzle-orm/singlestore-core";

interface GetNotesByLocationQueryOptionsProprs {
  location: {
    lat: number;
    lng: number;
  };
}
export function getNotesByLocationQueryOptions({ location }: GetNotesByLocationQueryOptionsProprs) {
  return infiniteQueryOptions({
    queryKey: ["notes", location],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await db.query.notes.findMany({
        // where: (notes, { eq }) => eq(notes.location, location),
        where: (notes, { eq, gt, or, and }) =>
          and(
            gt(notes.id, pageParam)
            // eq(notes.location, location)
          ),
        limit: 100,
        // offset: pageParam
      });
      return {
        result,
        eoor: null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.result) return undefined;
      const prevItem = lastPage.result.at(-1);
      if (!prevItem) return undefined;
      return prevItem?.id;
    },
  });
}

interface GetNoteByIdQueryOptionsProps {
  id: number;
}
export function getNoteByIdQueryOptions({ id }: GetNoteByIdQueryOptionsProps) {
  return queryOptions({
    queryKey: ["notes", id],
    queryFn: async () => {
      try {
        const result = await db.query.notes.findFirst({
          where: (notes, { eq }) => eq(notes.id, id),
        });
        return {
          result,
          error: null,
        };
      } catch (error) {
        return {
          result: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });
}

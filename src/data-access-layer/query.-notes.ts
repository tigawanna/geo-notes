import { db } from "@/lib/drizzle/client";
import { infiniteQueryOptions } from "@tanstack/react-query";

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

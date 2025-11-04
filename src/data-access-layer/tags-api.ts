import { db } from "@/lib/drizzle/client";
import { tags, type TInsertTag, type TTag } from "@/lib/drizzle/schema";
import { generateUUID } from "@/lib/expo-crypto/uuid";
import { eq } from "drizzle-orm";

export async function getTags(): Promise<TTag[]> {
  return await db.select().from(tags).all();
}

export async function getTagById(id: string): Promise<TTag | undefined> {
  const result = await db.select().from(tags).where(eq(tags.id, id)).get();
  return result;
}

export async function createTag(tag: Omit<TInsertTag, "id" | "created">): Promise<TTag> {
  const newTag: TInsertTag = {
    id: generateUUID(),
    ...tag,
  };
  
  await db.insert(tags).values(newTag).run();
  return newTag as TTag;
}

export async function updateTag(id: string, updates: Partial<Omit<TTag, "id" | "created">>): Promise<void> {
  await db.update(tags).set(updates).where(eq(tags.id, id)).run();
}

export async function deleteTag(id: string): Promise<void> {
  await db.delete(tags).where(eq(tags.id, id)).run();
}

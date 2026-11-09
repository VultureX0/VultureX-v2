import { revalidatePath } from "next/cache";

/** Refresh both the roadmap page and the For You summary after a mutation. */
export function revalidateRoadmap() {
  revalidatePath("/knowledge-hub/roadmap");
  revalidatePath("/knowledge-hub/for-you");
}

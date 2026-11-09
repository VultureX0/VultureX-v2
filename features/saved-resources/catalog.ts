/**
 * Server-authoritative catalogue of saveable Knowledge Hub entries.
 *
 * The client sends only a key (the existing hub href). The server looks the key
 * up here and stores a snapshot, so a request cannot save arbitrary titles,
 * categories or links.
 */

import {
  FEATURED_RESOURCES,
  HUB_SECTIONS,
  hubAnchor,
  hubSectionHref,
} from "@/lib/knowledge-hub";

export type SavedResourceCatalogEntry = {
  key: string;
  title: string;
  description: string;
  category: string;
  href: string;
};

const entries = new Map<string, SavedResourceCatalogEntry>();

function add(entry: SavedResourceCatalogEntry) {
  if (!entries.has(entry.key)) entries.set(entry.key, entry);
}

for (const resource of FEATURED_RESOURCES) {
  add({
    key: resource.href,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    href: resource.href,
  });
}

for (const section of HUB_SECTIONS) {
  // The personalized workspace is not a static resource.
  if (section.slug === "for-you") continue;

  const sectionHref = hubSectionHref(section.slug);
  add({
    key: sectionHref,
    title: section.title,
    description: section.summary,
    category: "Knowledge Hub",
    href: sectionHref,
  });

  for (const topic of section.topics) {
    const href = `${sectionHref}#${hubAnchor(topic.title)}`;
    add({
      key: href,
      title: topic.title,
      description: topic.description,
      category: section.title,
      href,
    });
  }

  for (const group of section.groups ?? []) {
    const href = `${sectionHref}#${hubAnchor(group.title)}`;
    add({
      key: href,
      title: group.title,
      description: group.description ?? `A group inside ${section.title}.`,
      category: section.title,
      href,
    });
  }
}

export function getSavedResourceCatalogEntry(
  key: unknown
): SavedResourceCatalogEntry | null {
  if (typeof key !== "string") return null;
  return entries.get(key) ?? null;
}

export function listSavedResourceCatalog(): SavedResourceCatalogEntry[] {
  return [...entries.values()];
}

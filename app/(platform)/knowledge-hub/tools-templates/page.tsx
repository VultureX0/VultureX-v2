import type { Metadata } from "next";
import { HubSectionView } from "@/components/knowledge-hub/SectionPage";
import { getHubSection } from "@/lib/knowledge-hub";

const SLUG = "tools-templates";

export function generateMetadata(): Metadata {
  const section = getHubSection(SLUG);
  return section ? { title: section.title, description: section.summary } : {};
}

export default function Page() {
  return <HubSectionView slug={SLUG} />;
}

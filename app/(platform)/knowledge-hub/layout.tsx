import { HubSearchForm } from "@/components/knowledge-hub/HubSearchForm";
import { SectionNav } from "@/components/knowledge-hub/SectionNav";
import { SavedResourcesProvider } from "@/components/knowledge-hub/saved/SavedResourcesProvider";

export default function KnowledgeHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <SavedResourcesProvider>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-3">
          <HubSearchForm />
        </div>

        <SectionNav />

        <div className="pt-6">{children}</div>
      </div>
    </SavedResourcesProvider>
  );
}

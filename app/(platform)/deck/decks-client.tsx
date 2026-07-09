"use client";

import { FileText, Plus, ExternalLink } from "lucide-react";
import { PageHeader, Section, Card, EmptyState, Button, ListItem, Avatar } from "@/components/ui";

type Deck = { id: string; title: string; shareToken: string; slideCount: number; createdAt: string };

export function DecksClient({ decks, noProfile }: { decks: Deck[]; noProfile?: boolean }) {
  if (noProfile) {
    return (
      <div>
        <PageHeader title="My Decks" />
        <EmptyState
          icon={FileText}
          title="No profile yet"
          description="Complete your startup profile first to generate a pitch deck."
          action={{ label: "Create profile", href: "/onboarding/startup" }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Decks"
        subtitle={`${decks.length} deck${decks.length !== 1 ? "s" : ""} generated`}
        action={<Button href="/deck/new" variant="primary"><Plus size={12} /> Generate new</Button>}
      />

      {decks.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No decks yet"
          description="Generate your first pitch deck from your profile data in 60 seconds."
          action={{ label: "Generate deck", href: "/deck/new" }}
        />
      ) : (
        <Section delay={0.1}>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {decks.map((d, i) => (
              <ListItem
                key={d.id}
                href={`/deck/${d.id}`}
                delay={i * 0.04}
                icon={<Avatar letter="D" />}
                title={d.title}
                subtitle={`${d.slideCount} slides · ${new Date(d.createdAt).toLocaleDateString()}`}
                trailing={
                  <span className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`/deck/view/${d.shareToken}`, "_blank"); }}>
                    Share <ExternalLink size={8} />
                  </span>
                }
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

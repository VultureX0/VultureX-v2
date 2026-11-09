"use client";

/**
 * Icons re-exported through a client boundary.
 *
 * Lucide icons are forwardRef objects. Importing them directly in a Server
 * Component and passing one as a prop (e.g. `<StatCard icon={Presentation} />`)
 * throws "Only plain objects can be passed to Client Components" — the prop
 * cannot be serialised across the RSC boundary. Importing them from this
 * client module turns them into client references, which are serialisable, so
 * the same markup works from Server Components.
 *
 * Server Components that only *render* an icon can still use lucide-react
 * directly; this module exists for icons that travel as props.
 */
export {
  Presentation,
  Clock,
  CheckCircle2,
  Hammer,
  Users,
  ShieldCheck,
  XCircle,
  Download,
  FileText,
  History,
} from "lucide-react";

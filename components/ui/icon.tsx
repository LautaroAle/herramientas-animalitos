import {
  FileText,
  Image as ImageIcon,
  QrCode,
  Barcode,
  Calculator,
  Type,
  Languages,
  UserSquare,
  ShieldCheck,
  Mail,
  Palette,
  Timer,
  Video,
  Code2,
  Receipt,
  ScanText,
  FileSignature,
  Search,
  type LucideProps
} from "lucide-react";
import type { IconName } from "@/lib/tools-registry";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  FileText,
  Image: ImageIcon,
  QrCode,
  Barcode,
  Calculator,
  Type,
  Languages,
  UserSquare,
  ShieldCheck,
  Mail,
  Palette,
  Timer,
  Video,
  Code2,
  Receipt,
  ScanText,
  FileSignature,
  Search
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = ICONS[name];
  return <Component {...props} />;
}

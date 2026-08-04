import { PawPrint } from "lucide-react";

export function KindnessBanner() {
  return (
    <div className="bg-gradient-to-r from-signal-coral to-signal-violet px-6 py-2.5 text-center text-sm font-medium text-white">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <PawPrint size={16} className="shrink-0" aria-hidden />
        Gracias por usar la página. Cada vez que entrás, recordá que es un granito de arena para ayudar a los
        animalitos <span aria-hidden>&lt;3</span>
      </p>
    </div>
  );
}

import { MapPin, Package, Sparkles, Users } from "lucide-react";

const items = [
  { icon: Sparkles, label: "Setup before you arrive" },
  { icon: Package, label: "Packed up after you leave" },
    { icon: MapPin, label: "Virginia Beach & Panama City Beach, FL" },
  { icon: Users, label: "Local & family-owned" },
];

export default function ValueStrip() {
  return (
    <section className="border-y border-border/60 bg-white">
      <div className="container mx-auto grid gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-sm font-medium text-[#083b6c]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f9ff] text-[#3b82b6]">
              <Icon className="h-5 w-5" />
            </span>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

import { Card, CardContent } from "./card";
import { Calendar, MapPin, UtensilsCrossed, Truck } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Calendar,
    title: "Reserve",
    description: "Book a package or custom setup in advance — or same-day on demand when slots remain.",
  },
  {
    number: "2",
    icon: MapPin,
    title: "Choose your spot",
    description: "Pick Virginia Beach or Panama City Beach (Bay County), then your street or beach access and setup time.",
  },
  {
    number: "3",
    icon: UtensilsCrossed,
    title: "Relax & order food",
    description: "Settle in, then order from local partners where available — delivered to your towel during food hours.",
  },
  {
    number: "4",
    icon: Truck,
    title: "We pack up",
    description: "When your rental ends, our crew packs everything so you can walk off the beach free.",
  },
];

const Features = () => {
  return (
    <section className="bg-[hsl(200,20%,98%)] py-24">
      <div className="container mx-auto px-4">
        <div id="learn-more" className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-semibold text-[#083b6c] sm:text-5xl">
            Your easiest beach day ever.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Four simple steps from reserve to pack-up — gear online, food when you&apos;re hungry.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="relative border-0 bg-white shadow-soft">
                <CardContent className="space-y-4 p-8 text-center">
                  <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82b6] text-sm font-bold text-white">
                    {step.number}
                  </div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9ff] text-[#3b82b6]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#083b6c]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

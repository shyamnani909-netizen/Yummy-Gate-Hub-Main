import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Clock, Heart, ShoppingBag, Truck } from "lucide-react";
import { ABOUT_FEATURES, ABOUT_STATS, ABOUT_VALUES } from "@/data/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tastely | Online Food Ordering" },
      {
        name: "description",
        content:
          "Learn about Tastely, a fast online food ordering platform for fresh meals, simple checkout, and reliable delivery.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              About Tastely
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Fresh food, simple ordering, fast delivery.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Tastely helps customers discover delicious meals, place orders quickly, and enjoy hot
              food delivered to their door. We focus on a clean menu experience, reliable checkout,
              and delivery that feels effortless.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/">
                <Button size="lg">Back to Home</Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="secondary">
                  Browse Menu
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {ABOUT_FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-xl border bg-card p-6 shadow-sm">
                  <h2 className="font-semibold text-lg">{feature.title}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Our promise to every customer</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Tastely is built for people who want delicious meals without the hassle. From a
                curated menu to secure checkout and dependable delivery, our team makes every order
                feel effortless.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {ABOUT_VALUES.map((value) => (
                  <div key={value.title} className="rounded-2xl border bg-secondary/50 p-5">
                    <h3 className="font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-primary/5 p-8">
              <h3 className="text-2xl font-semibold">Fast facts</h3>
              <div className="mt-6 space-y-4">
                {ABOUT_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border bg-card p-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Built for busy food lovers</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Whether you are ordering lunch for the office or dinner for the family, Tastely is
                designed to make every meal convenient, enjoyable, and delivered when you want it.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, HeartHandshake, MapPin, Users } from "lucide-react";
import {
  CAREERS_BENEFITS,
  CAREERS_FEATURES,
  CAREERS_OPENINGS,
  CAREERS_STATS,
} from "@/data/careers";

const FEATURE_ICONS = {
  users: Users,
  briefcase: BriefcaseBusiness,
  heart: HeartHandshake,
  map: MapPin,
};

type FeatureIconKey = keyof typeof FEATURE_ICONS;

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at Tastely | Online Food Ordering" },
      {
        name: "description",
        content:
          "Explore careers at Tastely and help build a faster, friendlier online food ordering experience.",
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Careers
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Help us make food ordering feel effortless.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              We are building a practical, reliable ordering experience for customers who want great
              meals without friction. Join Tastely to work on product, operations, support, and
              delivery experiences that people use every day.
            </p>
            <div className="mt-8">
              <Link to="/">
                <Button size="lg">Back to Home</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto grid gap-6 px-4 md:grid-cols-4">
            {CAREERS_FEATURES.map((item) => {
              const Icon = FEATURE_ICONS[item.icon as FeatureIconKey];
              return (
                <div key={item.title} className="rounded-xl border bg-card p-6">
                  <Icon className="mb-3 h-7 w-7 text-primary" />
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Open roles</h2>
            <p className="text-muted-foreground mt-2">
              Join Tastely on a team that moves fast and cares about quality.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {CAREERS_OPENINGS.map((job) => (
              <div key={job.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground mb-4">
                  <span>{job.department}</span>
                  <span>{job.type}</span>
                </div>
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
                <p className="mt-4 text-sm font-medium">Location: {job.location}</p>
                <div className="mt-6">
                  <a
                    href={job.applyUrl}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Apply now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Why teams love working here</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Our recruiting strategy is centered on people who care about practical product
                outcomes, strong collaboration, and customer success.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {CAREERS_BENEFITS.map((benefit) => (
                  <li key={benefit} className="rounded-2xl border bg-card p-4">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {CAREERS_STATS.map((stat) => (
                <div key={stat.label} className="rounded-3xl border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { HelpCircle, Heart, MessageCircle, Clock } from "lucide-react";
import { HELP_ARTICLES, HELP_FAQ } from "@/data/help";
import { CONTACT_INFO } from "@/data/contact";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center | Tastely" },
      {
        name: "description",
        content: "Find answers, support, and how-to guides for using Tastely.",
      },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Get the support you need to order with confidence.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Browse helpful articles, frequently asked questions, and contact information for
              support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <a href={CONTACT_INFO.supportUrl}>
                <Button size="lg">Email Support</Button>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">Quick articles</h2>
              <p className="text-muted-foreground mt-2">
                Answers to common questions and step-by-step guidance.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {HELP_ARTICLES.map((article) => (
                <div key={article.title} className="rounded-3xl border bg-card p-6 shadow-sm">
                  <div className="inline-flex items-center gap-2 text-primary mb-4">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Article</span>
                  </div>
                  <h3 className="text-xl font-semibold">{article.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{article.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
              <div className="mt-8 space-y-5">
                {HELP_FAQ.map((item) => (
                  <div key={item.question} className="rounded-2xl border bg-card p-6">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border bg-primary/5 p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Clock className="h-4 w-4" />
                Need help now?
              </div>
              <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">Email</p>
                  <p>{CONTACT_INFO.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">Phone</p>
                  <p>{CONTACT_INFO.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">Support hours</p>
                  <p>{CONTACT_INFO.hours}</p>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href={CONTACT_INFO.supportUrl}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Contact support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { IOS_APP_STORE_URL } from "../lib/app-links";
import { blogPosts, getBlogPost, type BlogPost } from "../lib/blog-posts";

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function linkifyProse(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const pattern =
    /(https:\/\/www\.instagram\.com\/shoredropemeraldcoast|Book your setup\.?)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[1];
    if (token.startsWith("https://")) {
      parts.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#3b82b6] underline underline-offset-2"
        >
          @shoredropemeraldcoast
        </a>,
      );
    } else {
      parts.push(
        <Link
          key={key++}
          href="/booking"
          className="font-semibold text-[#083b6c] underline underline-offset-2"
        >
          Book your setup.
        </Link>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export default function BlogPostContent({ post }: { post: BlogPost }) {
  const relatedFromSlugs = (post.relatedSlugs ?? [])
    .map((slug) => getBlogPost(slug))
    .filter(Boolean) as BlogPost[];
  const related =
    relatedFromSlugs.length > 0
      ? relatedFromSlugs.slice(0, 3)
      : blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const updated = post.updatedAt ?? post.publishedAt;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-32">
        <article className="space-y-8">
          <header className="space-y-4">
            <a href="/blog/" className="text-sm text-muted-foreground hover:text-ocean-deep">
              ← All posts
            </a>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{post.category}</p>
            <h1 className="text-3xl font-light leading-tight text-ocean-deep md:text-5xl">{post.title}</h1>
            <p className="text-sm text-muted-foreground">
              ShoreDrop LLC · Last updated: {formatDate(updated)}
            </p>
          </header>

          <img
            src={post.image}
            alt={post.imageAlt}
            className="h-[260px] w-full rounded-2xl object-cover sm:h-[380px]"
          />

          {post.directAnswer ? (
            <p className="text-base font-semibold leading-relaxed text-ocean-deep">
              {post.directAnswer}
            </p>
          ) : null}

          <section className="space-y-8">
            {post.sections.map((section) => {
              const HeadingTag = section.level === 3 ? "h3" : "h2";
              return (
                <div key={`${section.level ?? 2}-${section.heading}`} className="space-y-3">
                  <HeadingTag
                    className={
                      section.level === 3
                        ? "text-xl font-semibold text-ocean-deep"
                        : "text-2xl font-semibold text-ocean-deep"
                    }
                  >
                    {section.heading}
                  </HeadingTag>
                  {section.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className="text-base leading-relaxed text-muted-foreground">
                      {linkifyProse(paragraph)}
                    </p>
                  ))}
                </div>
              );
            })}
          </section>

          {post.faqs && post.faqs.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-ocean-deep">Frequently asked questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq) => (
                  <div key={faq.question} className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-ocean-deep">{faq.question}</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {post.closingCta ? (
            <p className="text-base leading-relaxed text-muted-foreground">{linkifyProse(post.closingCta)}</p>
          ) : null}

          <div className="space-y-3 rounded-2xl border border-[#083b6c]/10 bg-[#e6f9ff]/60 p-6 text-center">
            <h2 className="text-xl font-semibold text-[#083b6c]">Ready to skip the hauling?</h2>
            <p className="text-sm text-muted-foreground">
              Download the ShoreDrop app and reserve your setup in minutes — Virginia Beach or Panama
              City Beach.
            </p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <a
                href={IOS_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#083b6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#062a4d]"
              >
                Download ShoreDrop on the App Store
              </a>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full border border-[#083b6c]/30 px-6 py-3 text-sm font-semibold text-[#083b6c] hover:bg-white"
              >
                Book on the website
              </Link>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-ocean-deep">You may also like</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <article
                  key={item.slug}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <a href={`/blog/${item.slug}/`} className="block">
                    <img src={item.image} alt={item.imageAlt} className="h-36 w-full object-cover" />
                    <div className="space-y-2 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {item.category}
                      </p>
                      <h3 className="text-base font-semibold leading-tight text-ocean-deep">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{formatShortDate(item.publishedAt)}</p>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

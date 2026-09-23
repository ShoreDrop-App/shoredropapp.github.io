import type { Metadata } from "next";
import type { BlogPost } from "./blog-posts";
import { SITE_URL } from "./site-url";

function isoDay(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const title = post.seoTitle ?? post.title;
  const modified = post.updatedAt ?? post.publishedAt;
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: "article",
      title,
      description: post.excerpt,
      url: `/blog/${post.slug}/`,
      publishedTime: isoDay(post.publishedAt),
      modifiedTime: isoDay(modified),
      authors: ["ShoreDrop LLC"],
      images: [
        {
          url: post.image,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [post.image],
    },
    other: {
      "article:published_time": isoDay(post.publishedAt),
      "article:modified_time": isoDay(modified),
      "article:section": post.category,
      "article:url": `${SITE_URL}/blog/${post.slug}/`,
    },
  };
}

export function blogPostJsonLd(post: BlogPost) {
  const modified = post.updatedAt ?? post.publishedAt;
  const image = post.image.startsWith("http") ? post.image : `${SITE_URL}${post.image}`;
  const blogPosting = {
    "@type": "BlogPosting",
    headline: post.seoTitle ?? post.title,
    description: post.excerpt,
    datePublished: isoDay(post.publishedAt),
    dateModified: isoDay(modified),
    articleSection: post.category,
    image: [image],
    author: {
      "@type": "Organization",
      name: "ShoreDrop LLC",
    },
    publisher: {
      "@type": "Organization",
      name: "ShoreDrop LLC",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/lovable-uploads/dbf79a37-c86d-49c9-af90-9fe7b44058fc.jpg`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
  };

  if (!post.faqs?.length) {
    return {
      "@context": "https://schema.org",
      ...blogPosting,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      blogPosting,
      {
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

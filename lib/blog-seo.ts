import type { Metadata } from "next";
import type { BlogPost } from "./blog-posts";
import { SITE_URL } from "./site-url";

export function blogPostMetadata(post: BlogPost): Metadata {
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}/`,
      publishedTime: `${post.publishedAt}T00:00:00.000Z`,
      modifiedTime: `${post.publishedAt}T00:00:00.000Z`,
      authors: ["ShoreDrop Team"],
      images: [
        {
          url: post.image,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    other: {
      "article:published_time": `${post.publishedAt}T00:00:00.000Z`,
      "article:section": post.category,
      "article:url": `${SITE_URL}/blog/${post.slug}/`,
    },
  };
}

export function blogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: `${post.publishedAt}T00:00:00.000Z`,
    dateModified: `${post.publishedAt}T00:00:00.000Z`,
    articleSection: post.category,
    image: [post.image.startsWith("http") ? post.image : `${SITE_URL}${post.image}`],
    author: {
      "@type": "Organization",
      name: "ShoreDrop Team",
    },
    publisher: {
      "@type": "Organization",
      name: "ShoreDrop",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/lovable-uploads/dbf79a37-c86d-49c9-af90-9fe7b44058fc.jpg`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
  };
}

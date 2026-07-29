import type { Metadata } from "next";
import BlogPostContent from "../../../components/BlogPostContent";
import { getBlogPost } from "../../../lib/blog-posts";
import { blogPostJsonLd, blogPostMetadata } from "../../../lib/blog-seo";

const post = getBlogPost("beach-day-with-baby-toddler-virginia-beach")!;

export const metadata: Metadata = blogPostMetadata(post);

export default function BlogArticlePage() {
  return (
    <>
      <BlogPostContent post={post} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd(post)) }}
      />
    </>
  );
}

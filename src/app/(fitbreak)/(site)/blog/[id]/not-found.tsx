import { ArrowLink, wrap } from "@/components/sites/fitbreak/editorial";
import { routes } from "@/components/sites/fitbreak/links";

/** blog-post.html `#not-found-state`, in the editorial style (ADR 0009). */
export default function BlogPostNotFound() {
  return (
    <div className={`${wrap} py-24 lg:py-36`}>
      <p className="fb-label fb-num mb-4 text-mute">404</p>
      <h1 className="fb-display mb-5 text-[clamp(2.75rem,7vw,5.75rem)]">Article Not Found</h1>
      <p className="mb-8 max-w-md text-lg text-mute">
        The article you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <ArrowLink href={routes.blog}>Browse All Articles</ArrowLink>
    </div>
  );
}

import Link from "next/link";

import { SadFaceIcon } from "@/components/sites/fitbreak/blog/blog-icons";
import { routes } from "@/components/sites/fitbreak/links";

/** blog-post.html `#not-found-state`. */
export default function BlogPostNotFound() {
  return (
    <div className="py-24 text-center">
      <div className="mx-auto max-w-md px-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <SadFaceIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900">Article Not Found</h3>
        <p className="mb-6 text-gray-600">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href={routes.blog}
          className="inline-block rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Browse All Articles
        </Link>
      </div>
    </div>
  );
}

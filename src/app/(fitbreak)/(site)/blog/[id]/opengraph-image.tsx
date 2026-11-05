import { blogPostShareCard, shareImageAlt } from "@/lib/fitbreak/share-facts";
import {
  renderShareImage,
  SHARE_IMAGE_CONTENT_TYPE,
  SHARE_IMAGE_SIZE,
} from "@/lib/fitbreak/share-image";
import { getPost, type BlogPost } from "@/services/fitbreak/blog";

// Share image (Open Graph) for a blog post: the post's own cover and title.
export const runtime = "nodejs";

type Params = { id: string };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const FALLBACK: Pick<BlogPost, "title" | "image"> = { title: "FitBreak Blog", image: "" };

async function cardFor(id: string) {
  const post = await getPost(safeDecode(id));
  return blogPostShareCard(post ?? FALLBACK);
}

// generateImageMetadata gives each post its own alt text (a static `alt`
// export cannot); the image is served at /blog/<id>/opengraph-image/cover.
export async function generateImageMetadata({ params }: { params: Params }) {
  const card = await cardFor(params.id);
  return [
    {
      id: "cover",
      alt: shareImageAlt(card),
      size: SHARE_IMAGE_SIZE,
      contentType: SHARE_IMAGE_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Params }) {
  return renderShareImage(await cardFor(params.id));
}

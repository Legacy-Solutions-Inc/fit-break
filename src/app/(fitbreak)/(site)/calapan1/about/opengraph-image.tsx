import { SHARE_CARDS, shareImageAlt } from "@/lib/fitbreak/share-facts";
import {
  renderShareImage,
  SHARE_IMAGE_CONTENT_TYPE,
  SHARE_IMAGE_SIZE,
} from "@/lib/fitbreak/share-image";

// Share image (Open Graph) for this page: its title, photo and one Studio Fact.
export const runtime = "nodejs";
export const alt = shareImageAlt(SHARE_CARDS.coach);
export const size = SHARE_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderShareImage(SHARE_CARDS.coach);
}

import { SHARE_CARDS, shareImageAlt } from "@/lib/fitbreak/share-facts";
import {
  renderShareImage,
  SHARE_IMAGE_CONTENT_TYPE,
  SHARE_IMAGE_SIZE,
} from "@/lib/fitbreak/share-image";

// Share image for the home page (and any (site) page without its own).
export const runtime = "nodejs";
export const alt = shareImageAlt(SHARE_CARDS.home);
export const size = SHARE_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderShareImage(SHARE_CARDS.home);
}

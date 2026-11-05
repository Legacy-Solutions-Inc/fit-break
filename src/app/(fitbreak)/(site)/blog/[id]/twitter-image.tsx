import OpengraphImage, { generateImageMetadata as openGraphImageMetadata } from "./opengraph-image";

// The X/Twitter card reuses the Open Graph share image. Declared as functions
// rather than re-exported: re-exporting them made this route 500 under Turbopack.
export const runtime = "nodejs";

type Props = { params: { id: string } };

export function generateImageMetadata(props: Props) {
  return openGraphImageMetadata(props);
}

export default function Image(props: Props) {
  return OpengraphImage(props);
}

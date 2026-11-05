import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { TITLE_LINE_HEIGHT, titleFontSize, type ShareCard } from "./share-facts";

// ─────────────────────────────────────────────────────────────────────────────
// Share-image renderer for the FitBreak Information Site (ADR 0009 editorial
// system): ink panel with the white logo, the page title in condensed caps,
// the fact on a crimson tag, and the page's own photo beside it.
// Node runtime: photos are read from public/ and transcoded with sharp, since
// satori cannot decode WebP. Satori can't use variable fonts or WOFF2, so the
// display face is the static Archivo Narrow cut from @fontsource/archivo-narrow
// (OFL-1.1), read as WOFF — the nearest static match to the site's Archivo at
// font-stretch 72%.
// ─────────────────────────────────────────────────────────────────────────────

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const SHARE_IMAGE_CONTENT_TYPE = "image/png";

const INK = "#17130f";
const PAPER = "#f5f1ea";
const CRIMSON = "#d71e49";

const PHOTO_WIDTH = 480;
const PAD_X = 64;
const PAD_Y = 56;
const LOGO_HEIGHT = 76;
/** Minimum space between the logo row and the title block. */
const TITLE_TOP_GAP = 40;
const FACT_HEIGHT = 44;
const FACT_GAP = 28;

const PUBLIC_DIR = path.join(process.cwd(), "public");

type Font = { name: string; data: Buffer; weight: 600 | 700; style: "normal" };

const DISPLAY = "Archivo Narrow";

let fontsPromise: Promise<Font[]> | undefined;

// Read at render time. Static cards are prerendered at build; blog-post cards
// render on demand, so a standalone server needs them traced (add an entry
// for these paths to next.config.ts outputFileTracingIncludes).
const FONT_FILES = {
  latin700: "node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-700-normal.woff",
  ext700: "node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-ext-700-normal.woff",
  latin600: "node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-600-normal.woff",
  ext600: "node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-ext-600-normal.woff",
} as const;

/**
 * Archivo Narrow 700 (display) and 600 (label). Satori picks one font per family
 * name, so the latin-ext subset (which carries the ₱ sign) is registered under
 * its own name and used as a glyph fallback.
 */
function loadFonts(): Promise<Font[]> {
  const read = (file: string) => readFile(path.join(process.cwd(), file));
  fontsPromise ??= Promise.all([
    read(FONT_FILES.latin700),
    read(FONT_FILES.ext700),
    read(FONT_FILES.latin600),
    read(FONT_FILES.ext600),
  ]).then(([latin700, ext700, latin600, ext600]) => [
    { name: DISPLAY, data: latin700, weight: 700, style: "normal" },
    { name: `${DISPLAY} Ext`, data: ext700, weight: 700, style: "normal" },
    { name: DISPLAY, data: latin600, weight: 600, style: "normal" },
    { name: `${DISPLAY} Ext`, data: ext600, weight: 600, style: "normal" },
  ]);
  return fontsPromise;
}

/** Disk path for a public URL path, refusing anything outside public/. */
function publicFile(publicPath: string): string {
  const resolved = path.join(PUBLIC_DIR, publicPath);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error(`Share image asset outside public/: ${publicPath}`);
  }
  return resolved;
}

async function dataUrl(image: sharp.Sharp, format: "jpeg" | "png"): Promise<string> {
  const buffer =
    format === "jpeg"
      ? await image.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      : await image.png().toBuffer();
  return `data:image/${format};base64,${buffer.toString("base64")}`;
}

let logoPromise: Promise<string> | undefined;

function loadLogo(): Promise<string> {
  logoPromise ??= dataUrl(
    sharp(publicFile("/sites/fitbreak/images/fitbreak-logo-white.png")).resize({
      height: LOGO_HEIGHT * 2,
    }),
    "png",
  );
  return logoPromise;
}

/** The page photo cropped to the photo column (WebP/JPEG in, JPEG out). */
async function loadPhoto(publicPath: string, align: ShareCard["photoAlign"]): Promise<string> {
  return dataUrl(
    sharp(publicFile(publicPath)).resize(PHOTO_WIDTH, SHARE_IMAGE_SIZE.height, {
      fit: "cover",
      position: align ?? "centre",
    }),
    "jpeg",
  );
}

/** Renders a 1200×630 PNG share image for a card. */
export async function renderShareImage(card: ShareCard): Promise<ImageResponse> {
  const [fonts, logo, photo] = await Promise.all([
    loadFonts(),
    loadLogo(),
    card.imagePath ? loadPhoto(card.imagePath, card.photoAlign) : Promise.resolve(null),
  ]);

  const panelWidth = SHARE_IMAGE_SIZE.width - (photo ? PHOTO_WIDTH : 0);
  const textWidth = panelWidth - PAD_X * 2;
  const titleHeight =
    SHARE_IMAGE_SIZE.height -
    PAD_Y * 2 -
    LOGO_HEIGHT -
    TITLE_TOP_GAP -
    (card.fact ? FACT_HEIGHT + FACT_GAP : 0);
  const fontSize = titleFontSize(card.title, textWidth, titleHeight);
  const words = card.title.split(/\s+/);
  const accentWords =
    card.accent && card.title.endsWith(card.accent) ? card.accent.split(/\s+/).length : 0;
  const accentFrom = words.length - accentWords;
  const logoWidth = Math.round((LOGO_HEIGHT * 1452) / 1036);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: INK,
        color: PAPER,
      }}
    >
      <div
        style={{
          width: panelWidth,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: `${PAD_Y}px ${PAD_X}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img> only */}
          <img src={logo} width={logoWidth} height={LOGO_HEIGHT} alt="" />
          <div style={{ width: 96, height: 10, backgroundColor: CRIMSON }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {card.fact ? (
            <div style={{ display: "flex", marginBottom: FACT_GAP }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  backgroundColor: CRIMSON,
                  color: "#ffffff",
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: 1.3,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 14px 5px",
                }}
              >
                {/* Each part stays on one line; a long fact wraps at its " · ". */}
                {card.fact.split(" · ").map((part, i, parts) => (
                  <span key={i} style={{ whiteSpace: "nowrap" }}>
                    {i < parts.length - 1 ? `${part}\u00a0·\u00a0` : part}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize,
              lineHeight: TITLE_LINE_HEIGHT,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                style={{
                  marginRight: "0.18em",
                  color: i >= accentFrom ? CRIMSON : PAPER,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- satori renders <img> only
        <img
          src={photo}
          width={PHOTO_WIDTH}
          height={SHARE_IMAGE_SIZE.height}
          alt=""
          style={{ objectFit: "cover" }}
        />
      ) : null}
    </div>,
    { ...SHARE_IMAGE_SIZE, fonts },
  );
}

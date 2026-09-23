// Renders resources/ source images for @capacitor/assets from the app icon SVG.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconSvg = await readFile(resolve(root, "public/icons/icon.svg"));
const outDir = resolve(root, "resources");
await mkdir(outDir, { recursive: true });

await writeFile(
  resolve(outDir, "icon.png"),
  await sharp(iconSvg, { density: 600 }).resize(1024, 1024).png().toBuffer(),
);

const glyph = await sharp(iconSvg, { density: 600 }).resize(900, 900).png().toBuffer();
for (const [name, background] of [
  ["splash.png", "#f6f1e8"],
  ["splash-dark.png", "#1c1916"],
]) {
  await writeFile(
    resolve(outDir, name),
    await sharp({
      create: { width: 2732, height: 2732, channels: 4, background },
    })
      .composite([{ input: glyph, gravity: "centre" }])
      .png()
      .toBuffer(),
  );
}

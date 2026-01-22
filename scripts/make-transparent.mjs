import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../public/logo.png');
const outputPath = path.join(__dirname, '../public/logo-transparent.png');

async function makeTransparent() {
  try {
    // Read the image
    const image = sharp(inputPath);
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create new buffer with transparency
    const newData = Buffer.alloc(info.width * info.height * 4);

    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * info.channels];
      const g = data[i * info.channels + 1];
      const b = data[i * info.channels + 2];

      // If pixel is very dark (black background), make it transparent
      // Keep white/light pixels visible
      const brightness = (r + g + b) / 3;

      if (brightness < 30) {
        // Dark pixel - make transparent
        newData[i * 4] = 0;
        newData[i * 4 + 1] = 0;
        newData[i * 4 + 2] = 0;
        newData[i * 4 + 3] = 0; // Alpha = 0 (transparent)
      } else {
        // Light pixel - keep it white/visible
        newData[i * 4] = r;
        newData[i * 4 + 1] = g;
        newData[i * 4 + 2] = b;
        newData[i * 4 + 3] = 255; // Alpha = 255 (opaque)
      }
    }

    // Save the new image
    await sharp(newData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toFile(outputPath);

    console.log('Transparent logo created at:', outputPath);
  } catch (error) {
    console.error('Error:', error);
  }
}

makeTransparent();

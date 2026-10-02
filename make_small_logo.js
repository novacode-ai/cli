import Jimp from 'jimp';
import fs from 'fs';

async function generate() {
    const img = await Jimp.read('../../assets/logo.png');
    img.autocrop();
    // Resize it to be extremely small (10 columns wide)
    img.resize(12, Jimp.AUTO);

    let output = '';
    for (let y = 0; y < img.bitmap.height; y += 2) {
        let row = '';
        for (let x = 0; x < img.bitmap.width; x++) {
            const topColor = Jimp.intToRGBA(img.getPixelColor(x, y));
            const bottomColor = y + 1 < img.bitmap.height ? Jimp.intToRGBA(img.getPixelColor(x, y + 1)) : {r:0,g:0,b:0,a:0};

            if (topColor.a === 0 && bottomColor.a === 0) {
                row += '\x1b[49m \x1b[0m';
            } else if (topColor.a > 0 && bottomColor.a === 0) {
                row += `\x1b[38;2;${topColor.r};${topColor.g};${topColor.b};49m▀\x1b[0m`;
            } else if (topColor.a === 0 && bottomColor.a > 0) {
                row += `\x1b[38;2;${bottomColor.r};${bottomColor.g};${bottomColor.b};49m▄\x1b[0m`;
            } else {
                row += `\x1b[38;2;${topColor.r};${topColor.g};${topColor.b};48;2;${bottomColor.r};${bottomColor.g};${bottomColor.b}m▀\x1b[0m`;
            }
        }
        output += row + '\n';
    }

    fs.writeFileSync('./src/logo.ts', `export const LOGO = \`${output.trimEnd()}\`;\n`);
}
generate();

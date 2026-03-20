const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');

const f1 = 'C:\\Users\\rubix\\OneDrive\\Desktop\\Checkout Verification Recording';
const f2 = 'C:\\Users\\rubix\\OneDrive\\Desktop\\Cart Addition Recording';

try {
    console.log('Converting file 1...');
    execSync(`"${ffmpeg}" -y -i "${f1}.webp" -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${f1}.gif"`, { stdio: 'inherit' });
    console.log('Converted file 1.');
} catch (e) {
    console.error('File 1 failed');
}

try {
    console.log('Converting file 2...');
    execSync(`"${ffmpeg}" -y -i "${f2}.webp" -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${f2}.gif"`, { stdio: 'inherit' });
    console.log('Converted file 2.');
} catch (e) {
    console.error('File 2 failed');
}

console.log('Done converting to GIF!');

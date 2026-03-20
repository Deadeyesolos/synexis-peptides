const sharp = require('sharp');

const f1 = 'C:\\Users\\rubix\\OneDrive\\Desktop\\Checkout Verification Recording';
const f2 = 'C:\\Users\\rubix\\OneDrive\\Desktop\\Cart Addition Recording';

async function convert(f) {
   console.log(`Starting conversion for ${f}.webp`);
   await sharp(`${f}.webp`, { animated: true, limitInputPixels: false })
      .toFormat('gif')
      .toFile(`${f}.gif`);
   console.log(`Successfully Converted ${f}.gif`);
}

async function run() {
   try { await convert(f1); } catch (e) { console.error('Error on f1:', e.message); }
   try { await convert(f2); } catch (e) { console.error('Error on f2:', e.message); }
}
run();

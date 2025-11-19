import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

const siteDir = '_site';

function walkDirectory(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (stat.isFile()) {
      const ext = file.split('.').pop().toLowerCase();
      if (['html', 'css', 'js', 'json', 'xml', 'svg', 'txt'].includes(ext)) {
        compressFile(filePath);
      }
    }
  }
}

function compressFile(filePath) {
  const content = readFileSync(filePath);
  
  // Gzip compression
  const gzipped = gzipSync(content, { level: 9 });
  writeFileSync(`${filePath}.gz`, gzipped);
  
  // Brotli compression
  const brotlied = brotliCompressSync(content, {
    params: {
      [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11
    }
  });
  writeFileSync(`${filePath}.br`, brotlied);
  
  console.log(`Compressed: ${filePath}`);
}

console.log('Starting compression...');
walkDirectory(siteDir);
console.log('Compression complete!');

/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

const files = glob.sync(`${process.cwd()}/src/**/*.d.ts`);

for (const file of files) {
    const dist = path.resolve(file);
    const writePath = dist.replace('src', 'dist');
    const distPath = path.dirname(writePath);
    console.log(`Copying [${file}] into ${writePath}`);
    if (!fs.existsSync(path.resolve(distPath))) {
        fs.mkdirSync(path.resolve(distPath));
    }
    const buffer: BufferSource = fs.readFileSync(file);
    fs.writeFileSync(writePath, buffer);
}

process.exit(0);

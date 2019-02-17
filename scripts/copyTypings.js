"use strict";
/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const files = glob.sync(`${process.cwd()}/src/**/*.d.ts`);
for (const file of files) {
    const dist = path.resolve(file);
    const writePath = dist.replace('src', 'dist');
    const distPath = path.dirname(writePath);
    console.log(`Copying [${file}] into ${writePath}`);
    if (!fs.existsSync(path.resolve(distPath))) {
        fs.mkdirSync(path.resolve(distPath));
    }
    const buffer = fs.readFileSync(file);
    fs.writeFileSync(writePath, buffer);
}
process.exit(0);

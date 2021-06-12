import { promises } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const { writeFile, readFile } = promises;

const dest = resolve(process.env.GITHUB_WORKSPACE, process.env['INPUT_DEST-PATH']);
const staticDir = resolve(fileURLToPath(import.meta.url), '../../static');

function getStaticFile(fname){
    return readFile(resolve(staticDir, fname), 'utf8');
}

export default async () => {
    const targetFiles = {
        'constants.go': getStaticFile('constants.go'),
    };
    await Promise.all(Object.keys(targetFiles).map(async file => writeFile(resolve(dest, file), await targetFiles[file])));
}

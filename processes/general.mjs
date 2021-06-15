import { promises } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const { writeFile, readFile, readdir, mkdir } = promises;

const dest = resolve(process.env.GITHUB_WORKSPACE, process.env['INPUT_DEST-PATH']);
const staticDir = resolve(fileURLToPath(import.meta.url), '../../static');

async function readDirRecursive(dirname){
	/** @type string[] */
	const files = [];
	const dirs = [];
	for(const dirent of await readdir(dirname, { withFileTypes: true })){
		if(dirent.isDirectory()) dirs.push(dirent.name);
		else if(dirent.isFile()) files.push(dirent.name);
	}
	const recursiveFiles = await Promise.all(dirs.map(dir => readDirRecursive(resolve(dirname, dir)).then(files => files.map(file => `${dir}/${file}`))));
	for(const dir of recursiveFiles) for(const file of dir) files.push(file);
	return files;
}

export default async () => {
	const staticFiles = await readDirRecursive(staticDir);
	const targetFiles = {};
	await Promise.all(staticFiles.map(async fname => { targetFiles[fname] = readFile(resolve(staticDir, fname), 'utf8') }));
	await Promise.all(Object.keys(targetFiles).map(async file => {
		const destFile = resolve(dest, file);
		try{ await mkdir(resolve(destFile, '..'), { recursive: true }) } catch(e){}
		await writeFile(destFile, await targetFiles[file]);
	}));
}

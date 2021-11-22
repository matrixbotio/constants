import { promises } from 'fs';
import { resolve } from 'path';
import js from '../generators/formula-parser-js.mjs';
import inputs from '../helpers/inputs.mjs';

const { readFile, writeFile, mkdir } = promises;

const configPath = inputs['config-path'],
	destPath = inputs['dest-path'],
	ghWorkspace = process.env.GITHUB_WORKSPACE;

const file = resolve(ghWorkspace, configPath, 'formula.pegjs');
const contentsPromise = readFile(file, 'utf8');

export default async () => {
	const contents = await contentsPromise;
	const targetFiles = Object.assign(...await Promise.all([
		{},
		js(contents),
	]));
	await Promise.all(Object.keys(targetFiles).map(async file => {
		const dest = resolve(ghWorkspace, destPath, 'formula-parser', file);
		await mkdir(resolve(dest, '..'), {
			recursive: true,
		});
		return writeFile(dest, targetFiles[file]);
	}));
}

import YAML from 'yaml';
import { promises } from 'fs';
import { resolve } from 'path';
import inputs from '../helpers/inputs.mjs';
import js from '../generators/notification-types-js.mjs';
import json from '../generators/notification-types-json.mjs';

const { readFile, writeFile, mkdir } = promises;

const configPath = inputs['config-path'],
	destPath = inputs['dest-path'],
	ghWorkspace = process.env.GITHUB_WORKSPACE;

const yamlFile = resolve(ghWorkspace, configPath, 'notification-types.yml');
const yaml = readFile(yamlFile, 'utf8').then(YAML.parse);

export default async () => {
	const structure = await yaml;
	const targetFiles = Object.assign(...await Promise.all([
		{},
		js(structure),
		json(structure),
	]));
	await Promise.all(Object.keys(targetFiles).map(async file => {
		const dest = resolve(ghWorkspace, destPath, 'notification-types', file);
		await mkdir(resolve(dest, '..'), {
			recursive: true,
		});
		return writeFile(dest, targetFiles[file]);
	}));
}

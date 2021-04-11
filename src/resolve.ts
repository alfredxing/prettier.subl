import * as fs from 'fs';
import * as path from 'path';
import { error } from './io';

export async function getPrettier(filePath: string) {
	const modulePath = await findModule(filePath, 'prettier');
	if (!modulePath) return undefined;

	// Load module
	const prettier = require(modulePath);

	// Make sure Prettier instance is valid
	if (prettier?.version && prettier?.format && prettier?.getFileInfo) {
		return prettier;
	} else {
		error('Prettier instance found is invalid');
	}
}

async function findModule(filePath: string, module: string) {
	const parts = filePath.split('/');
	for (let level = parts.length - 1; level >= 1; level--) {
		const dir = parts.slice(0, level).join('/');
		try {
			const packageJsonPath = path.join(dir, 'package.json');
			await fs.promises.access(packageJsonPath, fs.constants.R_OK);

			const packageJson = JSON.parse(
				await fs.promises.readFile(packageJsonPath, 'utf-8')
			);
			if (
				packageJson?.dependencies?.[module] ||
				packageJson?.devDependencies?.[module]
			) {
				return require.resolve(module, { paths: [dir] });
			}
		} catch {
			// Resolving here failed, but do nothing
		}
	}
}

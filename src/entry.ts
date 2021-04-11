import * as resolve from './resolve';
import { error, skip, res, readInput } from './io';

async function run() {
	const { filePath, source } = await readInput();

	if (!filePath) {
		error('No file path passed in');
	}

	const prettier = await resolve.getPrettier(filePath);
	if (!prettier) {
		skip('No prettier found');
	}

	const fileInfo = await prettier.getFileInfo(filePath);
	if (fileInfo?.ignored || !fileInfo?.inferredParser) {
		skip('File is ignored or has no parser');
	}

	const config = await prettier.resolveConfig(filePath);
	const formatted = prettier.format(source, {
		parser: fileInfo.inferredParser,
		...config,
	});

	res({ formatted });
}

run();

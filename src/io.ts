export function error(message: string) {
	process.stderr.write(message);
	process.exit(1);
}

export function skip(reason: string) {
	process.stdout.write(JSON.stringify({ skip: true, reason }));
	process.exit(0);
}

export async function res(result: { formatted: string }) {
	const done = process.stdout.write(JSON.stringify(result));
	if (!done) {
		await new Promise((resolve) => {
			process.stdout.on('drain', resolve);
		});
	}
	process.exit(0);
}

export async function readInput() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(chunk);
	return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}

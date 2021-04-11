export function error(message: string) {
	process.stderr.write(message);
	process.exit(1);
}

export function skip(reason: string) {
	process.stdout.write(JSON.stringify({ skip: true, reason }));
	process.exit(0);
}

export function res(result: { formatted: string }) {
	process.stdout.write(JSON.stringify(result));
	process.exit(0);
}

export async function readInput() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(chunk);
	return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}

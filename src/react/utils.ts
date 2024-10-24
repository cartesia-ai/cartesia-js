/**
 * Ping the server to calculate the round-trip time. This is useful for buffering audio in high-latency environments.
 * @param url The URL to ping.
 */

export async function pingServer(url: string): Promise<number> {
	const start = new Date().getTime();
	await fetch(url);
	const end = new Date().getTime();
	return end - start;
}

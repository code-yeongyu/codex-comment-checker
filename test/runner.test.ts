import { describe, expect, it } from "vitest";

import { MAX_PROCESS_OUTPUT_BYTES, spawnProcess } from "../src/runner.js";

describe("spawnProcess", () => {
	it("#given noisy checker process #when output exceeds cap #then stderr is bounded", async () => {
		// given
		const maxOutputBytes = 16;

		// when
		const result = await spawnProcess(
			process.execPath,
			["-e", "process.stderr.write('x'.repeat(40)); process.exit(2);"],
			"",
			maxOutputBytes,
		);

		// then
		expect(MAX_PROCESS_OUTPUT_BYTES).toBeGreaterThan(maxOutputBytes);
		expect(result.exitCode).toBe(2);
		expect(result.stderr).toBe(`${"x".repeat(maxOutputBytes)}\n[stderr truncated after 16 bytes]`);
	});
});

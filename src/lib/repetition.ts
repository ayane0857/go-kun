export const REPETITION_TARGET = 3;

export function startRepetition() {
	return 0;
}

export function advanceRepetition(count: number) {
	const nextCount = count + 1;
	return {
		count: nextCount,
		complete: nextCount >= REPETITION_TARGET,
	};
}

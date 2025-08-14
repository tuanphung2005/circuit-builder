export function calculateCurveSize(c0: CFrame, c1: CFrame): [number, number] {
	const p0 = c0.Position;
	const p1 = c1.Position;

	const delta = p1.sub(p0);
	const dot = delta.Dot(c0.RightVector);
	const curveValue = -dot * 0.2;

	return [curveValue, curveValue];
}

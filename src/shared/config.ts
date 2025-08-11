export const PlacementOffset = new Vector3(0, 0, 0);
export const GridSize = 2.5;

export const GridVisualRadius = 6;
export const GridVisualHeightOffset = 0.05;
export const GridVisualTransparency = 0.9;
export const GridVisualColor = new Color3(1, 1, 1); // white cells

export const GridDynamicRadiusTiers = [
	{ maxDist: 40, radius: 3 },
	{ maxDist: 80, radius: 2 },
	{ maxDist: 160, radius: 1 },
];
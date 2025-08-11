import { GridSize, GridVisualRadius, GridVisualHeightOffset, GridVisualTransparency, GridVisualColor, GridDynamicRadiusTiers } from "shared/config";

export class GridVisualizationService {
	private folder: Folder;
	private active = false;
	private pool = new Map<string, BasePart>(); // poolKey => line part
	private shownKeys = new Set<string>(); // keys shown this frame
	private lastSnapX?: number; // last snapped center to avoid redundant work
	private lastSnapZ?: number;
	private lastRadius?: number;

	constructor(parent?: Instance) {
		this.folder = new Instance("Folder");
		this.folder.Name = "__GridVisual";
		(this.folder as Folder).Parent = parent ?? game.GetService("Workspace");
	}

	enable() { this.active = true; }
	disable() { this.active = false; this.clearShown(); }
	isEnabled() { return this.active; }

	private key(axis: "X" | "Z", index: number, fixed: number) { return `${axis}:${index}:${fixed}`; }

	private acquireLine(axis: "X" | "Z", index: number, fixed: number): BasePart {
		const k = this.key(axis, index, fixed);
		let part = this.pool.get(k);
		if (!part) {
			part = new Instance("Part");
			part.Anchored = true;
			part.CanCollide = false;
			part.CanQuery = false;
			part.CanTouch = false;
			part.Material = Enum.Material.Neon;
			part.Color = GridVisualColor;
			part.Transparency = GridVisualTransparency;
			part.Name = `GridLine_${k}`;
			part.Parent = this.folder;
			this.pool.set(k, part);
		}
		return part;
	}

	private clearShown() {

		for (const k of this.shownKeys) {
			const part = this.pool.get(k);
			if (part) part.Parent = undefined as unknown as Instance; // detach for reuse
		}
		this.shownKeys.clear();
		this.lastSnapX = undefined;
		this.lastSnapZ = undefined;
		this.lastRadius = undefined;
	}

	private pickRadius(centerWorld: Vector3): number {
		const camera = game.GetService("Workspace").CurrentCamera;
		if (!camera) return GridVisualRadius;
		const dist = camera.CFrame.Position.sub(centerWorld).Magnitude;
		for (const tier of GridDynamicRadiusTiers) {
			if (dist <= tier.maxDist) return tier.radius;
		}
		return 1; // fallback smallest
	}

	update(centerWorld: Vector3) {
		if (!this.active) return;
		const radius = this.pickRadius(centerWorld);
		const snappedX = math.round(centerWorld.X / GridSize) * GridSize;
		const snappedZ = math.round(centerWorld.Z / GridSize) * GridSize;

		if (this.lastSnapX === snappedX && this.lastSnapZ === snappedZ && this.lastRadius === radius) return;
		this.lastSnapX = snappedX;
		this.lastSnapZ = snappedZ;
		this.lastRadius = radius;


		const needed = new Set<string>();
		const span = GridSize * (radius * 2 + 1);
		const y = centerWorld.Y + GridVisualHeightOffset;
		for (let i = -radius; i <= radius; i++) {
			const gz = snappedZ + i * GridSize;
			const lineKeyZ = this.key("Z", i, gz);
			const lineX = this.acquireLine("Z", i, gz);
			lineX.Size = new Vector3(span, 0.05, 0.05);
			lineX.CFrame = new CFrame(snappedX, y, gz);
			lineX.Parent = this.folder;
			needed.add(lineKeyZ);

			const gx = snappedX + i * GridSize;
			const lineKeyX = this.key("X", i, gx);
			const lineZ = this.acquireLine("X", i, gx);
			lineZ.Size = new Vector3(0.05, 0.05, span);
			lineZ.CFrame = new CFrame(gx, y, snappedZ);
			lineZ.Parent = this.folder;
			needed.add(lineKeyX);
		}

		for (const oldKey of this.shownKeys) {
			if (!needed.has(oldKey)) {
				const p = this.pool.get(oldKey);
				if (p) p.Parent = undefined as unknown as Instance;
			}
		}
		this.shownKeys = needed;
	}
}

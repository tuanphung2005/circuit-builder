import { wireService } from "client/services/WireService";
import { WiringMode } from "client/controllers/modes/WiringMode";

export class CutWireMode {
	private active = false;
	private componentRoot: Folder;
	private uiParent: Instance;
	private wiringMode: WiringMode;
	private hoverHighlight?: Highlight;
	private hoverPart?: BasePart;

	constructor(componentRoot: Folder, uiParent: Instance, wiringMode: WiringMode) {
		this.componentRoot = componentRoot;
		this.uiParent = uiParent;
		this.wiringMode = wiringMode;
	}
	enter() { if (this.active) return; this.active = true; }
	exit() { if (!this.active) return; this.active = false; this.clearHover(); }
	isActive() { return this.active; }

	onClick(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) return;
		const model = this.raycastModel(mouse, camera);
		if (model) {
			const removed = wireService.removeConnectionsForComponent(model);
			this.wiringMode.invalidateCache(removed);
		}
	}

	onHeartbeat(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) { if (this.hoverPart) this.clearHover(); return; }
		const model = this.raycastModel(mouse, camera);
		const part = model ? (model.PrimaryPart || model.FindFirstChildWhichIsA("BasePart")) as BasePart | undefined : undefined;
		if (part !== this.hoverPart) { if (part) this.ensureHighlight(); if (this.hoverHighlight) this.hoverHighlight.Adornee = model; this.hoverPart = part; }
	}

	private ensureHighlight() {
		if (!this.hoverHighlight) {
			const h = new Instance("Highlight");
			h.Name = "CutWireHover";
			h.FillTransparency = 1;
			h.OutlineTransparency = 0;
			h.OutlineColor = new Color3(1, 0.6, 0); // orange
			h.Parent = this.uiParent;
			this.hoverHighlight = h;
		}
	}
	private clearHover() { if (this.hoverHighlight) this.hoverHighlight.Adornee = undefined; this.hoverPart = undefined; }

	private isEndpoint(part: BasePart) { const n = part.Name; return n === "Out" || n === "In" || n.sub(1,2) === "In"; }
	private raycastModel(mouse: PlayerMouse, camera: Camera): Model | undefined {
		const origin = camera.CFrame.Position; const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		if (result && result.Instance) {
			const model = result.Instance.FindFirstAncestorOfClass("Model");
			if (model && model.Parent === this.componentRoot) return model;
		}
		return undefined;
	}
}

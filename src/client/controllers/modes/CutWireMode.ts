import { wireService } from "client/services/WireService";
import { WiringMode } from "client/controllers/modes/WiringMode";

// CutWireMode: click an input or output endpoint to remove all wires attached to that endpoint.
export class CutWireMode {
	private active = false;
	private componentRoot: Folder;
	private uiParent: Instance;
	private wiringMode: WiringMode; // to invalidate cache
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
		const target = this.raycastEndpoint(mouse, camera);
		if (target) {
			const removed = wireService.removeConnectionsForEndpoint(target);
			this.wiringMode.invalidateCache(removed);
		}
	}

	onHeartbeat(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) { if (this.hoverPart) this.clearHover(); return; }
		const endpoint = this.raycastEndpoint(mouse, camera);
		if (endpoint !== this.hoverPart) {
			if (endpoint) this.ensureHighlight();
			if (this.hoverHighlight) this.hoverHighlight.Adornee = endpoint;
			this.hoverPart = endpoint;
		}
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
	private raycastEndpoint(mouse: PlayerMouse, camera: Camera): BasePart | undefined {
		const origin = camera.CFrame.Position; const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		if (result && result.Instance) {
			const part = result.Instance.FindFirstAncestorWhichIsA("BasePart");
			if (part && this.isEndpoint(part)) return part;
		}
		return undefined;
	}
}

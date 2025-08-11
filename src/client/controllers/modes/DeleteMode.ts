export class DeleteMode {
	private active = false;
	private componentRoot: Folder;
	private uiParent: Instance;
	private hoverHighlight?: Highlight;
	private hoverTarget?: Model;

	constructor(componentRoot: Folder, uiParent: Instance) {
		this.componentRoot = componentRoot;
		this.uiParent = uiParent;
	}

	enter() { if (this.active) return; this.active = true; }
	exit() { if (!this.active) return; this.active = false; this.clearHover(); }
	isActive() { return this.active; }

	onClick(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) return;
		const origin = camera.CFrame.Position;
		const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		if (result && result.Instance) {
			const model = result.Instance.FindFirstAncestorOfClass("Model");
			if (model && model.Parent === this.componentRoot) model.Destroy();
		}
	}

	onHeartbeat(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) { if (this.hoverTarget) this.clearHover(); return; }
		const origin = camera.CFrame.Position;
		const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		let newTarget: Model | undefined;
		if (result && result.Instance) {
			const model = result.Instance.FindFirstAncestorOfClass("Model");
			if (model && model.Parent === this.componentRoot) newTarget = model;
		}
		if (newTarget !== this.hoverTarget) {
			if (newTarget) this.ensureHoverHighlight();
			if (this.hoverHighlight) this.hoverHighlight.Adornee = newTarget;
			this.hoverTarget = newTarget;
		}
	}

	private ensureHoverHighlight() {
		if (!this.hoverHighlight) {
			const h = new Instance("Highlight");
			h.Name = "DeleteHover";
			h.FillTransparency = 1;
			h.OutlineColor = new Color3(1, 0.2, 0.2);
			h.OutlineTransparency = 0;
			h.DepthMode = Enum.HighlightDepthMode.Occluded;
			h.Parent = this.uiParent;
			this.hoverHighlight = h;
		}
	}

	private clearHover() {
		if (this.hoverHighlight) this.hoverHighlight.Adornee = undefined;
		this.hoverTarget = undefined;
	}
}

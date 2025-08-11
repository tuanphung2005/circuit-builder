import { wireService } from "client/services/WireService";

interface WireHighlights {
	hover?: Highlight;
	selected?: Highlight;
}

export class WiringMode {
	private active = false;
	private componentRoot: Folder;
	private uiParent: Instance;
	private highlights: WireHighlights = {};
	private startPart?: BasePart;
	private existingKeys = new Set<string>();
	private wiresFolder: Folder;

	private previewBeam?: Beam;
	private previewAttachment?: Attachment; // at mouse position (world proxy)
	private previewPart?: Part; // invisible part to host attachment

	constructor(componentRoot: Folder, uiParent: Instance) {
		this.componentRoot = componentRoot;
		this.uiParent = uiParent;
		let folder = game.GetService("Workspace").FindFirstChild("Wires") as Folder | undefined;
		if (!folder) { folder = new Instance("Folder"); folder.Name = "Wires"; folder.Parent = game.GetService("Workspace"); }
		this.wiresFolder = folder;
	}
	enter() { if (this.active) return; this.active = true; this.clear(); }
	exit() { if (!this.active) return; this.active = false; this.clear(); this.cleanupPreviewBeam(); }
	isActive() { return this.active; }
	invalidateCache(keys: string[]) { for (const k of keys) this.existingKeys.delete(k); }

	private ensureHighlights() {
		if (!this.highlights.hover) {
			const h = new Instance("Highlight"); h.Name = "WireHover"; h.FillTransparency = 1; h.OutlineTransparency = 0; h.OutlineColor = new Color3(1,1,0.3); h.Parent = this.uiParent; this.highlights.hover = h;
		}
		if (!this.highlights.selected) {
			const s = new Instance("Highlight"); s.Name = "WireSelected"; s.FillTransparency = 1; s.OutlineTransparency = 0; s.OutlineColor = new Color3(0.3,1,0.3); s.Parent = this.uiParent; this.highlights.selected = s;
		}
	}

	private clear() {
		if (this.highlights.hover) this.highlights.hover.Adornee = undefined;
		if (this.highlights.selected) this.highlights.selected.Adornee = undefined;
		this.startPart = undefined;
	}

	private isInput(part: BasePart) { const n = part.Name; return n === "In" || n.sub(1,2) === "In"; }
	private isOutput(part: BasePart) { return part.Name === "Out"; }
	private endpointFrom(inst: Instance): BasePart | undefined {
		if (inst.IsA("BasePart")) { if (this.isInput(inst) || this.isOutput(inst)) return inst; }
		const part = inst.FindFirstAncestorWhichIsA("BasePart");
		if (part && (this.isInput(part) || this.isOutput(part))) return part;
		return undefined;
	}
	private ensureAttachment(part: BasePart): Attachment { let a = part.FindFirstChild("WireAttachment") as Attachment; if (!a) { a = new Instance("Attachment"); a.Name = "WireAttachment"; a.Parent = part; } return a; }
	private createWire(outPart: BasePart, inPart: BasePart) {
		// Use the same key format as WireService (ComponentId-based) so identical component names don't collide.
		const outModel = outPart.FindFirstAncestorOfClass("Model");
		const inModel = inPart.FindFirstAncestorOfClass("Model");
		if (!outModel || !inModel || outModel === inModel) return;
		let outId = outModel.GetAttribute("ComponentId") as number | undefined;
		let inId = inModel.GetAttribute("ComponentId") as number | undefined;
		// Fallback: assign temporary ids if binder somehow missed (will also let WireService set one later)
		if (outId === undefined) { outId = math.random(1, 10_000_000); outModel.SetAttribute("ComponentId", outId); }
		if (inId === undefined) { inId = math.random(1, 10_000_000); inModel.SetAttribute("ComponentId", inId); }
		const key = `${outId}:${outPart.Name}->${inId}:${inPart.Name}`;
		if (this.existingKeys.has(key)) {
			// debug: prevent silent refusal when user attempts duplicate
			// print(`[WiringMode] Duplicate wire prevented: ${key}`);
			return;
		}
		this.existingKeys.add(key);
		const a0 = this.ensureAttachment(outPart); const a1 = this.ensureAttachment(inPart);
		const beam = new Instance("Beam");
		beam.Attachment0 = a0; beam.Attachment1 = a1;
		beam.Width0 = 0.1; beam.Width1 = 0.1;
		beam.Color = new ColorSequence(new Color3(0,1,1));
		beam.Parent = this.wiresFolder;
		beam.Name = key;
		wireService.addConnection(outPart, inPart, beam);
	}

	onClick(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) return;
		const origin = camera.CFrame.Position; const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		if (!result || !result.Instance) { this.startPart = undefined; if (this.highlights.selected) this.highlights.selected.Adornee = undefined; return; }
		const endpoint = this.endpointFrom(result.Instance);
		if (!endpoint) { this.startPart = undefined; if (this.highlights.selected) this.highlights.selected.Adornee = undefined; return; }
		this.ensureHighlights();
		if (!this.startPart) { this.startPart = endpoint; if (this.highlights.selected) this.highlights.selected.Adornee = endpoint; return; }
		if (this.startPart === endpoint) return; // same click
		const aIsOut = this.isOutput(this.startPart); const bIsOut = this.isOutput(endpoint);
		if (aIsOut !== bIsOut) {
			const outPart = aIsOut ? this.startPart : endpoint;
			const inPart = aIsOut ? endpoint : this.startPart;
			this.createWire(outPart, inPart);
			this.startPart = undefined; if (this.highlights.selected) this.highlights.selected.Adornee = undefined; if (this.highlights.hover) this.highlights.hover.Adornee = undefined;
		} else {
			this.startPart = endpoint; if (this.highlights.selected) this.highlights.selected.Adornee = endpoint;
		}
	}

	onHeartbeat(mouse: PlayerMouse, camera: Camera) {
		if (!this.active) { if (this.highlights.hover) this.highlights.hover.Adornee = undefined; return; }
		const origin = camera.CFrame.Position; const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
		const params = new RaycastParams(); params.FilterType = Enum.RaycastFilterType.Include; params.FilterDescendantsInstances = [this.componentRoot];
		const result = game.GetService("Workspace").Raycast(origin, dir, params);
		const endpoint = result && result.Instance ? this.endpointFrom(result.Instance) : undefined;
		this.ensureHighlights();
		if (this.highlights.hover) this.highlights.hover.Adornee = endpoint;
		if (this.highlights.hover) {
			if (this.startPart && endpoint && endpoint !== this.startPart) {
				const valid = this.isOutput(this.startPart) !== this.isOutput(endpoint);
				this.highlights.hover.OutlineColor = valid ? new Color3(1,1,0.3) : new Color3(1,0.2,0.2);
			} else {
				this.highlights.hover.OutlineColor = new Color3(1,1,0.3);
			}
		}

		// Update preview beam if we have a start but no endpoint yet
		if (this.startPart) {
			const startIsOut = this.isOutput(this.startPart);
			// show preview only when expecting the second endpoint of opposite type
			if (!endpoint || (endpoint !== this.startPart && (this.isOutput(endpoint) !== startIsOut))) {
				this.updatePreviewBeam(camera, mouse);
			} else {
				this.cleanupPreviewBeam();
			}
		} else this.cleanupPreviewBeam();
	}

	private updatePreviewBeam(camera: Camera, mouse: PlayerMouse) {
		const originPart = this.startPart; if (!originPart) return;
		const attach0 = this.ensureAttachment(originPart);
		if (!this.previewPart) {
			const p = new Instance("Part"); p.Size = new Vector3(0.2,0.2,0.2); p.Transparency = 1; p.CanCollide = false; p.Anchored = true; p.Name = "WirePreviewAnchor"; p.Parent = this.wiresFolder; this.previewPart = p;
		}
		if (!this.previewAttachment) {
			const att = new Instance("Attachment"); att.Name = "WirePreviewAttachment"; att.Parent = this.previewPart!; this.previewAttachment = att;
		}
		if (!this.previewBeam) {
			const beam = new Instance("Beam"); beam.Attachment0 = attach0; beam.Attachment1 = this.previewAttachment!; beam.Width0 = 0.05; beam.Width1 = 0.05; beam.Transparency = new NumberSequence(0.2); beam.Color = new ColorSequence(new Color3(0,1,1)); beam.Parent = this.wiresFolder; this.previewBeam = beam;
		}
		// Position preview part at mouse hit
		const pos = mouse.Hit.Position; this.previewPart!.CFrame = new CFrame(pos);
	}
	private cleanupPreviewBeam() {
		if (this.previewBeam) { this.previewBeam.Destroy(); this.previewBeam = undefined; }
		if (this.previewPart) { this.previewPart.Destroy(); this.previewPart = undefined; this.previewAttachment = undefined; }
	}
}

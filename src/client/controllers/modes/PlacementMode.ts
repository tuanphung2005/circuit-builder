import { PreviewService } from "client/components/placement/PreviewService";
import { ComponentBinder } from "client/components/ComponentBinder";

export class PlacementMode {
	private previewService: PreviewService;
	private binder: ComponentBinder;
	private componentRoot: Folder;
	private mouse: PlayerMouse;
	private isPlacing = false;
	private currentPreview?: Model;
	private selectedComponent?: Model;

	constructor(previewService: PreviewService, binder: ComponentBinder, componentRoot: Folder, mouse: PlayerMouse) {
		this.previewService = previewService;
		this.binder = binder;
		this.componentRoot = componentRoot;
		this.mouse = mouse;
	}

	start(component: Model) {
		if (this.isPlacing) this.cancel();
		this.isPlacing = true;
		this.selectedComponent = component;
		const preview = this.previewService.createPreview(component, game.GetService("Workspace"));
		this.currentPreview = preview;
		this.previewService.startUpdating(preview, this.mouse);
	}

	confirm() {
		if (!this.isPlacing || !this.currentPreview) return;
		this.previewService.solidify(this.currentPreview);
		this.isPlacing = false;
		this.previewService.stopUpdating();
		this.currentPreview.Name = this.selectedComponent ? this.selectedComponent.Name : this.currentPreview.Name;
		this.currentPreview.Parent = this.componentRoot;
		this.binder.bind(this.currentPreview);
		this.currentPreview = undefined;
		this.selectedComponent = undefined;
	}

	cancel() {
		if (!this.isPlacing) return;
		this.isPlacing = false;
		this.previewService.stopUpdating();
		this.currentPreview = undefined;
		this.selectedComponent = undefined;
		this.previewService.destroyAllPreviews(game.GetService("Workspace"));
	}

	isActive() { return this.isPlacing; }
}

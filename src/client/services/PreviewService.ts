import { PlacementOffset } from "shared/config";

export class PreviewService {
	private connection?: RBXScriptConnection;
	private currentPreview?: Model;

	createPreview(model: Model, parent: Instance): Model {
		const preview = model.Clone();
		preview.Name = `Preview_${model.Name}`;
		preview.Parent = parent;

		// make semi-transparent & non-collidable
		const parts = preview.GetDescendants().filter((p): p is BasePart => p.IsA("BasePart"));
		for (const part of parts) {
			part.Transparency = 0.5;
			part.CanCollide = false;
		}

		this.currentPreview = preview;
		return preview;
	}

	startUpdating(preview: Model, mouse: PlayerMouse, runService = game.GetService("RunService")) {
		this.stopUpdating();
		this.connection = runService.Heartbeat.Connect(() => {
			const mousePos = mouse.Hit.Position.add(PlacementOffset);
			preview.PivotTo(new CFrame(mousePos));
		});
	}

	stopUpdating() {
		this.connection?.Disconnect();
		this.connection = undefined;
	}

	solidify(preview: Model) {
		const parts = preview.GetDescendants().filter((p): p is BasePart => p.IsA("BasePart"));
		for (const part of parts) {
			part.Transparency = 0;
			part.CanCollide = true;
		}
	}

	destroyAllPreviews(scope: Instance) {
		const toDestroy = scope.GetChildren().filter((child) => {
			const result = string.find(child.Name, "Preview_");
			return result !== undefined && result[0] === 1;
		});
		for (const preview of toDestroy) preview.Destroy();
	}
}

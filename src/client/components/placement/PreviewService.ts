import { PlacementOffset, GridSize } from "shared/config";
import { GridVisualizationService } from "client/components/placement/GridVisualizationService";

export class PreviewService {
	private connection?: RBXScriptConnection;
	private currentPreview?: Model;
	private gridVis = new GridVisualizationService();

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
		// cache bounding box
		const [, size] = preview.GetBoundingBox();
		const halfHeight = size.Y / 2;
		const workspace = game.GetService("Workspace");
		const rayParams = new RaycastParams();
		rayParams.FilterType = Enum.RaycastFilterType.Exclude;
		rayParams.FilterDescendantsInstances = [preview];

		// enable grid visual
		this.gridVis.enable();

		this.connection = runService.Heartbeat.Connect(() => {
			const aim = mouse.Hit.Position;
			// snap horizontally
			const snappedX = math.round(aim.X / GridSize) * GridSize;
			const snappedZ = math.round(aim.Z / GridSize) * GridSize;

			// raycast
			const origin = new Vector3(snappedX, aim.Y + 500, snappedZ);
			const direction = new Vector3(0, -2000, 0);
			const result = workspace.Raycast(origin, direction, rayParams);
			let baseY = aim.Y; // fallback
			if (result) baseY = result.Position.Y;

			const finalY = baseY + halfHeight + PlacementOffset.Y;
			const finalPos = new Vector3(snappedX, finalY, snappedZ);
			preview.PivotTo(new CFrame(finalPos));
			this.gridVis.update(finalPos);
		});
	}

	stopUpdating() {
		this.connection?.Disconnect();
		this.connection = undefined;
		this.gridVis.disable();
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

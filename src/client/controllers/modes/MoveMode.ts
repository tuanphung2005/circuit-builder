import { PreviewService } from "client/components/placement/PreviewService";
import { wireService } from "client/services/WireService";

export class MoveMode {
    private active = false;
    private componentRoot: Folder;
    private previewService: PreviewService;
    private mouse: PlayerMouse;

    private movingComponent?: Model;
    private originalCFrame?: CFrame;

    constructor(componentRoot: Folder, previewService: PreviewService, mouse: PlayerMouse) {
        this.componentRoot = componentRoot;
        this.previewService = previewService;
        this.mouse = mouse;
    }

    enter() {
        if (this.active) return;
        this.active = true;
    }

    exit() {
        if (!this.active) return;
        this.active = false;
        this.cancelMove();
    }

    isActive() {
        return this.active;
    }

    onClick(mouse: PlayerMouse, camera: Camera) {
        if (!this.active) return;

        if (this.movingComponent) {
            this.placeComponent();
        } else {
            this.pickupComponent(mouse, camera);
        }
    }

    cancelMove() {
        if (this.movingComponent) {
            this.previewService.stopUpdating();
            this.movingComponent.Parent = this.componentRoot;
            this.movingComponent = undefined;
        }
    }

    private pickupComponent(mouse: PlayerMouse, camera: Camera) {
        const model = this.raycastModel(mouse, camera);
        if (model) {
            this.movingComponent = model;
            this.originalCFrame = model.GetPivot();

            this.previewService.startUpdating(model, this.mouse);
        }
    }

    private placeComponent() {
        if (this.movingComponent) {
            this.previewService.stopUpdating();
            this.previewService.solidify(this.movingComponent);
            this.movingComponent.Parent = this.componentRoot;
            wireService.updateConnectionsForComponent(this.movingComponent);
            this.movingComponent = undefined;
        }
    }

    private raycastModel(mouse: PlayerMouse, camera: Camera): Model | undefined {
        const origin = camera.CFrame.Position;
        const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
        const params = new RaycastParams();
        params.FilterType = Enum.RaycastFilterType.Include;
        params.FilterDescendantsInstances = [this.componentRoot];
        const result = game.GetService("Workspace").Raycast(origin, dir, params);
        if (result && result.Instance) {
            const model = result.Instance.FindFirstAncestorOfClass("Model");
            if (model && model.Parent === this.componentRoot) {
                return model;
            }
        }
        return undefined;
    }
}

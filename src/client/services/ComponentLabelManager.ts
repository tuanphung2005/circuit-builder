export class ComponentLabelManager {
	private componentRoot: Folder;
	private mouse: PlayerMouse;
	private currentHoveredComponent?: Model;
	private heartbeatConnection?: RBXScriptConnection;
	private childAddedConnection?: RBXScriptConnection;
	private childRemovedConnection?: RBXScriptConnection;

	constructor(componentRoot: Folder, mouse: PlayerMouse) {
		this.componentRoot = componentRoot;
		this.mouse = mouse;
		this.hideAllLabels();
		this.startHoverDetection();
		this.setupComponentMonitoring();
	}

	private setupComponentMonitoring() {
		this.childAddedConnection = this.componentRoot.ChildAdded.Connect((child) => {
			if (child.IsA("Model")) {
				this.setComponentLabelVisible(child, false);
			}
		});

		this.childRemovedConnection = this.componentRoot.ChildRemoved.Connect((child) => {
			if (child.IsA("Model") && this.currentHoveredComponent === child) {
				this.currentHoveredComponent = undefined;
			}
		});
	}

	private hideAllLabels() {
		for (const component of this.componentRoot.GetChildren()) {
			if (component.IsA("Model")) {
				this.setComponentLabelVisible(component, false);
			}
		}
	}

	private setComponentLabelVisible(component: Model, visible: boolean) {
		const billboardGui = component.FindFirstChildWhichIsA("BillboardGui");
		if (billboardGui) {
			billboardGui.Enabled = visible;
		}
	}

	private startHoverDetection() {
		const RunService = game.GetService("RunService");
		
		this.heartbeatConnection = RunService.Heartbeat.Connect(() => {
			const hoveredComponent = this.getHoveredComponent();
			
			if (hoveredComponent !== this.currentHoveredComponent) {
				if (this.currentHoveredComponent) {
					this.setComponentLabelVisible(this.currentHoveredComponent, false);
				}

                
				if (hoveredComponent) {
					this.setComponentLabelVisible(hoveredComponent, true);
				}
				
				this.currentHoveredComponent = hoveredComponent;
			}
		});
	}

	private getHoveredComponent(): Model | undefined {
		const camera = game.GetService("Workspace").CurrentCamera;
		if (!camera) return undefined;

		const origin = camera.CFrame.Position;
		const direction = this.mouse.Hit.Position.sub(origin).Unit.mul(500);
		
		const raycastParams = new RaycastParams();
		raycastParams.FilterType = Enum.RaycastFilterType.Include;
		raycastParams.FilterDescendantsInstances = [this.componentRoot];
		
		const result = game.GetService("Workspace").Raycast(origin, direction, raycastParams);
		
		if (result && result.Instance) {
			const model = result.Instance.FindFirstAncestorOfClass("Model");
			if (model && model.Parent === this.componentRoot) {
				return model;
			}
		}
		
		return undefined;
	}

	public destroy() {
		if (this.heartbeatConnection) {
			this.heartbeatConnection.Disconnect();
			this.heartbeatConnection = undefined;
		}
		if (this.childAddedConnection) {
			this.childAddedConnection.Disconnect();
			this.childAddedConnection = undefined;
		}
		if (this.childRemovedConnection) {
			this.childRemovedConnection.Disconnect();
			this.childRemovedConnection = undefined;
		}
	}
}

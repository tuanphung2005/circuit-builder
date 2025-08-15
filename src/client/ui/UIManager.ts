import { PlacementController } from "client/controllers/PlacementController.client";
import { ComponentRepository } from "client/services/ComponentRepository";

export class UIManager {
	private controller: PlacementController;
	private modeIndicator: TextLabel;
	private deleteButton: TextButton;
	private wireButton: TextButton;
	private cutWireButton: TextButton;
	private moveButton: TextButton;

	constructor(controller: PlacementController, repo: ComponentRepository) {
		this.controller = controller;

		const player = game.GetService("Players").LocalPlayer;
		const playerGui = player.WaitForChild("PlayerGui");
		const componentUI = playerGui.WaitForChild("ComponentUI");
		const containerFrame = componentUI.WaitForChild("Frame") as Frame;
		const frame = containerFrame.WaitForChild("Frame") as ScrollingFrame;

		const buttonsContainer = componentUI.WaitForChild("Buttons") as Frame;
		this.deleteButton = buttonsContainer.WaitForChild("Delete") as TextButton;
		this.wireButton = buttonsContainer.WaitForChild("Wire") as TextButton;
		this.cutWireButton = buttonsContainer.WaitForChild("CutWire") as TextButton;
		this.moveButton = buttonsContainer.WaitForChild("Move") as TextButton;

		let indicator = componentUI.FindFirstChild("ModeIndicator") as TextLabel | undefined;
		if (!indicator) {
			indicator = new Instance("TextLabel");
			indicator.Name = "ModeIndicator";
			indicator.Size = new UDim2(1, 0, 0, 24);
			indicator.Position = new UDim2(0, 0, 0, -24);
			indicator.BackgroundTransparency = 1;
			indicator.TextScaled = true;
			indicator.TextColor3 = new Color3(1, 0.2, 0.2);
			indicator.Visible = false;
			indicator.Parent = componentUI;
		}
		this.modeIndicator = indicator;

		this.connectEvents();
		this.populateComponentList(frame, repo);
	}

	private connectEvents() {
		this.deleteButton.MouseButton1Click.Connect(() => this.controller.activateDelete());
		this.wireButton.MouseButton1Click.Connect(() => this.controller.activateWiring());
		this.cutWireButton.MouseButton1Click.Connect(() => this.controller.activateCut());
		this.moveButton.MouseButton1Click.Connect(() => this.controller.activateMove());
	}

	private populateComponentList(parent: ScrollingFrame, repo: ComponentRepository) {
		for (const component of repo.getAll()) {
			const button = new Instance("TextButton");
			button.Name = component.Name;
			button.Text = component.Name;
			button.Parent = parent;
			button.MouseButton1Click.Connect(() => {
				this.controller.startPlacing(component as Model);
			});
		}
	}

	public updateModeIndicator(activeModes: { [key: string]: boolean | undefined }) {
		if (activeModes.delete) {
			this.modeIndicator.Text = "DELETE MODE";
			this.modeIndicator.Visible = true;
		} else if (activeModes.cut) {
			this.modeIndicator.Text = "CUT MODE";
			this.modeIndicator.Visible = true;
		} else if (activeModes.wire) {
			this.modeIndicator.Text = "WIRING MODE";
			this.modeIndicator.Visible = true;
		} else if (activeModes.move) {
			this.modeIndicator.Text = "MOVING";
			this.modeIndicator.Visible = true;
		} else if (activeModes.place) {
			this.modeIndicator.Text = "PLACING";
			this.modeIndicator.Visible = true;
		} else {
			this.modeIndicator.Visible = false;
		}
	}

	public syncButtons(activeModes: { [key: string]: boolean | undefined }) {
		const sync = (button: TextButton, isActive: boolean, text: string, color: Color3) => {
			button.Text = isActive ? `Exit ${text}` : text;
			button.BackgroundColor3 = isActive ? color : new Color3(0.15, 0.15, 0.15);
		};

		sync(this.deleteButton, activeModes.delete ?? false, "Delete", new Color3(0.5, 0, 0));
		sync(this.wireButton, activeModes.wire ?? false, "Wire", new Color3(0, 0.3, 0.6));
		sync(this.cutWireButton, activeModes.cut ?? false, "CutWire", new Color3(0.6, 0.3, 0));
		sync(this.moveButton, activeModes.move ?? false, "Move", new Color3(0.4, 0.4, 0.4));
	}
}

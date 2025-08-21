import { ComponentRepository } from "client/services/ComponentRepository";
import { PreviewService } from "client/components/placement/PreviewService";
import { ComponentBinder } from "client/components/ComponentBinder";
import { wireService } from "client/services/WireService";
import { PlacementMode } from "client/controllers/modes/PlacementMode";
import { DeleteMode } from "client/controllers/modes/DeleteMode";
import { WiringMode } from "client/controllers/modes/WiringMode";
import { CutWireMode } from "client/controllers/modes/CutWireMode";
import { MoveMode } from "client/controllers/modes/MoveMode";
import { ClickDetectorManager } from "client/services/ClickDetectorManager";
import { ComponentLabelManager } from "client/services/ComponentLabelManager";
import { KeybindManager } from "client/controllers/KeybindManager";
import { UIManager } from "client/ui/UIManager";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Workspace = game.GetService("Workspace");
const UserInputService = game.GetService("UserInputService");
const RunService = game.GetService("RunService");

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const ComponentUI = playerGui.WaitForChild("ComponentUI");
const containerFrame = ComponentUI.WaitForChild("Frame") as Frame;
const frame = containerFrame.WaitForChild("Frame") as ScrollingFrame;

const componentsFolder = ReplicatedStorage.WaitForChild("Components") as Folder;
const repo = new ComponentRepository(componentsFolder);
const previewService = new PreviewService();
const binder = new ComponentBinder();

const COMPONENT_ROOT_NAME = "PlacedComponents";
let componentRoot = Workspace.FindFirstChild(COMPONENT_ROOT_NAME) as Folder | undefined;
if (!componentRoot) { componentRoot = new Instance("Folder"); componentRoot.Name = COMPONENT_ROOT_NAME; componentRoot.Parent = Workspace; }

const clickDetectorManager = new ClickDetectorManager(componentRoot);

binder.bindDescendants(Workspace);

const mouse = player.GetMouse();
const componentLabelManager = new ComponentLabelManager(componentRoot, mouse);

const placementMode = new PlacementMode(previewService, binder, componentRoot, mouse);
const deleteMode = new DeleteMode(componentRoot, ComponentUI);
const wiringMode = new WiringMode(componentRoot, ComponentUI);
const cutWireMode = new CutWireMode(componentRoot, ComponentUI, wiringMode);
const moveMode = new MoveMode(componentRoot, previewService, mouse);

export class PlacementController {
	private uiManager: UIManager;

	constructor() {
		this.uiManager = new UIManager(this, repo);
		new KeybindManager(this);
	}

	private getActiveModes() {
		return {
			delete: deleteMode.isActive(),
			wire: wiringMode.isActive(),
			cut: cutWireMode.isActive(),
			move: moveMode.isActive(),
			place: placementMode.isActive(),
		};
	}

	private updateUI() {
		this.uiManager.updateModeIndicator(this.getActiveModes());
		this.uiManager.syncButtons(this.getActiveModes());
	}

	startPlacing(component: Model) {
		this.exitAllModes();
		placementMode.start(component);
		this.updateUI();
	}

	confirmPlacement() {
		placementMode.confirm();
		this.updateUI();
	}

	exitAllModes() {
		placementMode.cancel();
		deleteMode.exit();
		wiringMode.exit();
		cutWireMode.exit();
		moveMode.exit();
		clickDetectorManager.enableAll();
		this.updateUI();
	}

	activateDelete() {
		if (deleteMode.isActive()) {
			deleteMode.exit();
			clickDetectorManager.enableAll();
		} else {
			this.exitAllModes();
			deleteMode.enter();
			clickDetectorManager.disableAll();
		}
		this.updateUI();
	}
	activateWiring() {
		if (wiringMode.isActive()) {
			wiringMode.exit();
			clickDetectorManager.enableAll();
		} else {
			this.exitAllModes();
			wiringMode.enter();
			clickDetectorManager.disableAll();
		}
		this.updateUI();
	}
	activateCut() {
		if (cutWireMode.isActive()) {
			cutWireMode.exit();
			clickDetectorManager.enableAll();
		} else {
			this.exitAllModes();
			cutWireMode.enter();
			clickDetectorManager.disableAll();
		}
		this.updateUI();
	}
	activateMove() {
		if (moveMode.isActive()) {
			moveMode.exit();
			clickDetectorManager.enableAll();
		} else {
			this.exitAllModes();
			moveMode.enter();
			clickDetectorManager.disableAll();
		}
		this.updateUI();
	}
}

const controller = new PlacementController();

// input
mouse.Button1Down.Connect(() => {
	const cam = Workspace.CurrentCamera;
	if (!cam) return;
	if (deleteMode.isActive()) {
		deleteMode.onClick(mouse, cam);
		return;
	}
	if (cutWireMode.isActive()) {
		cutWireMode.onClick(mouse, cam);
		return;
	}
	if (wiringMode.isActive()) {
		wiringMode.onClick(mouse, cam);
		return;
	}
	if (moveMode.isActive()) {
		moveMode.onClick(mouse, cam);
		return;
	}
	if (placementMode.isActive()) {
		controller.confirmPlacement();
		return;
	}
});
UserInputService.InputBegan.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.Q) {
		if (deleteMode.isActive() || wiringMode.isActive() || moveMode.isActive()) {
			controller.exitAllModes();
		} else {
			placementMode.cancel();
		}
	}
	if (input.KeyCode === Enum.KeyCode.Escape) {
		controller.exitAllModes();
	}
});

RunService.Heartbeat.Connect(() => {
	const cam = Workspace.CurrentCamera;
	if (!cam) return;
	deleteMode.onHeartbeat(mouse, cam);
});
RunService.Heartbeat.Connect(() => {
	const cam = Workspace.CurrentCamera;
	if (!cam) return;
	wiringMode.onHeartbeat(mouse, cam);
});
RunService.Heartbeat.Connect(() => {
	const cam = Workspace.CurrentCamera;
	if (!cam) return;
	cutWireMode.onHeartbeat(mouse, cam);
});

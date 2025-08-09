import { PlacementOffset } from "shared/config";
import { ComponentRepository } from "client/services/ComponentRepository";
import { PreviewService } from "client/services/PreviewService";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Workspace = game.GetService("Workspace");
const UserInputService = game.GetService("UserInputService");

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const ComponentUI = playerGui.WaitForChild("ComponentUI");
const frame = ComponentUI.WaitForChild("Frame") as ScrollingFrame;

const componentsFolder = ReplicatedStorage.WaitForChild("Components") as Folder;
const repo = new ComponentRepository(componentsFolder);
const previewService = new PreviewService();

let isPlacing = false;
let currentPreview: Model | undefined;
let selectedComponent: Model | undefined;

const mouse = player.GetMouse();

function startPlacing(component: Model) {
	// cancel previous placement if any
	if (isPlacing) {
		previewService.stopUpdating();
		currentPreview?.Destroy();
		currentPreview = undefined;
		previewService.destroyAllPreviews(Workspace);
	}

	isPlacing = true;
	selectedComponent = component;

	const preview = previewService.createPreview(component, Workspace);
	currentPreview = preview;
	previewService.startUpdating(preview, mouse);
}

function placeCurrent() {
	if (!isPlacing || !currentPreview) return;
	previewService.solidify(currentPreview);
	isPlacing = false;
	previewService.stopUpdating();
	currentPreview.Name = selectedComponent ? selectedComponent.Name : currentPreview.Name;
	currentPreview = undefined;
	selectedComponent = undefined;
}

function cancelPlacement() {
	if (!isPlacing) return;
	isPlacing = false;
	previewService.stopUpdating();
	currentPreview = undefined;
	selectedComponent = undefined;
	previewService.destroyAllPreviews(Workspace);
}

function initUI() {
	for (const component of repo.getAll()) {
		const button = new Instance("TextButton");
		button.Name = component.Name;
		button.Text = component.Name;
		// uigridlayout handled this
		// button.Size = new UDim2(1, 0, 0, 50); 
		button.Parent = frame;
		button.MouseButton1Click.Connect(() => startPlacing(component as Model));
	}
}

// input hooks
mouse.Button1Down.Connect(() => placeCurrent());
UserInputService.InputBegan.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.Q) cancelPlacement();
});

initUI();

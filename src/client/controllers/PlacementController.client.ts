import { PlacementOffset } from "shared/config";
import { ComponentRepository } from "client/services/ComponentRepository";
import { PreviewService } from "client/components/placement/PreviewService";
import { ComponentBinder } from "client/components/ComponentBinder";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Workspace = game.GetService("Workspace");
const UserInputService = game.GetService("UserInputService");

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const ComponentUI = playerGui.WaitForChild("ComponentUI");
const frame = ComponentUI.WaitForChild("Frame") as ScrollingFrame;
let deleteButtonRef: TextButton | undefined; // assigned in initUI
let modeIndicator: TextLabel | undefined;

const componentsFolder = ReplicatedStorage.WaitForChild("Components") as Folder;
const repo = new ComponentRepository(componentsFolder);
const previewService = new PreviewService();
const binder = new ComponentBinder();

binder.bindDescendants(Workspace);

let isPlacing = false;
let currentPreview: Model | undefined;
let selectedComponent: Model | undefined;
let deleteMode = false;
function applyDeleteVisual() {
	if (!deleteButtonRef) return;
	if (deleteMode) {
		deleteButtonRef.Text = "Exit Delete";
		deleteButtonRef.BackgroundColor3 = new Color3(0.5, 0, 0);
		if (modeIndicator) {
			modeIndicator.Text = "DELETE MODE";
			modeIndicator.Visible = true;
		}
	} else {
		deleteButtonRef.Text = "Delete";
		deleteButtonRef.BackgroundColor3 = new Color3(0.15, 0.15, 0.15);
		if (modeIndicator) modeIndicator.Visible = false;
	}
}

function enterDeleteMode() {
	if (deleteMode) return;
	deleteMode = true;
	if (isPlacing) cancelPlacement();
	applyDeleteVisual();
	// print("[Placement] Delete mode ON");
}

function exitDeleteMode() {
	if (!deleteMode) return;
	deleteMode = false;
	applyDeleteVisual();
	// print("[Placement] Delete mode OFF");
}

const mouse = player.GetMouse();

const COMPONENT_ROOT_NAME = "PlacedComponents";
let componentRoot = Workspace.FindFirstChild(COMPONENT_ROOT_NAME) as Folder | undefined;
if (!componentRoot) {
	componentRoot = new Instance("Folder");
	componentRoot.Name = COMPONENT_ROOT_NAME;
	componentRoot.Parent = Workspace;
}

function startPlacing(component: Model) {
	if (deleteMode) return; // block while in delete mode
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
	// Reparent into dedicated component root
	currentPreview.Parent = componentRoot;
	// register component behavior(s)
	binder.bind(currentPreview);
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
	const deleteButton = ComponentUI.FindFirstChild("Delete");
	if (deleteButton && deleteButton.IsA("TextButton")) {
		deleteButtonRef = deleteButton;

		const existing = ComponentUI.FindFirstChild("ModeIndicator");
		if (existing && existing.IsA("TextLabel")) {
			modeIndicator = existing;
		} else {

			const label = new Instance("TextLabel");
			label.Name = "ModeIndicator";
			label.Size = new UDim2(1, 0, 0, 24);
			label.Position = new UDim2(0, 0, 0, -24);
			label.BackgroundTransparency = 1;
			label.TextScaled = true;
			label.Text = "";
			label.TextColor3 = new Color3(1, 0.2, 0.2);
			label.Visible = false;
			label.Parent = ComponentUI;
			modeIndicator = label;
			
		}
		deleteButton.MouseButton1Click.Connect(() => {
			if (deleteMode) exitDeleteMode(); else enterDeleteMode();
		});
		applyDeleteVisual();
	}
	for (const component of repo.getAll()) {
		const button = new Instance("TextButton");
		button.Name = component.Name;
		button.Text = component.Name;
		// uigridlayout handled this
		// button.Size = new UDim2(1, 0, 0, 50); 
		button.Parent = frame;
		button.MouseButton1Click.Connect(() => {
			if (deleteMode) return;
			startPlacing(component as Model);
		});
	}
}

// input hooks
mouse.Button1Down.Connect(() => {
	if (deleteMode) {

		const cam = Workspace.CurrentCamera;
		if (cam) {
			const origin = cam.CFrame.Position;
			const dir = mouse.Hit.Position.sub(origin).Unit.mul(500);
			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Include;

			if (componentRoot) params.FilterDescendantsInstances = [componentRoot];
			const result = Workspace.Raycast(origin, dir, params);
			if (result && result.Instance) {
				const model = result.Instance.FindFirstAncestorOfClass("Model");
				if (model && model.Parent === componentRoot) {
					print(`[Placement] Deleting ${model.Name}`);
					model.Destroy();
				}
			}
		}
		return;
	}
	placeCurrent();
});
UserInputService.InputBegan.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.Q) {
		if (deleteMode) exitDeleteMode(); else cancelPlacement();
	}
	if (input.KeyCode === Enum.KeyCode.Escape && deleteMode) exitDeleteMode();
});

initUI();

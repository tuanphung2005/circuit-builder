import { ComponentRepository } from "client/services/ComponentRepository";
import { PreviewService } from "client/components/placement/PreviewService";
import { ComponentBinder } from "client/components/ComponentBinder";
import { wireService } from "client/services/WireService"; // ensure imported for side effects
import { PlacementMode } from "client/controllers/modes/PlacementMode";
import { DeleteMode } from "client/controllers/modes/DeleteMode";
import { WiringMode } from "client/controllers/modes/WiringMode";
import { CutWireMode } from "client/controllers/modes/CutWireMode";
import { MoveMode } from "client/controllers/modes/MoveMode";

const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Workspace = game.GetService("Workspace");
const UserInputService = game.GetService("UserInputService");
const RunService = game.GetService("RunService");

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const ComponentUI = playerGui.WaitForChild("ComponentUI");
const frame = ComponentUI.WaitForChild("Frame") as ScrollingFrame;

let modeIndicator: TextLabel | undefined;
let deleteButtonRef: TextButton | undefined;
let wireButtonRef: TextButton | undefined;
let cutWireButtonRef: TextButton | undefined;
let moveButtonRef: TextButton | undefined;

// Roots & services
const componentsFolder = ReplicatedStorage.WaitForChild("Components") as Folder;
const repo = new ComponentRepository(componentsFolder);
const previewService = new PreviewService();
const binder = new ComponentBinder();

const COMPONENT_ROOT_NAME = "PlacedComponents";
let componentRoot = Workspace.FindFirstChild(COMPONENT_ROOT_NAME) as Folder | undefined;
if (!componentRoot) { componentRoot = new Instance("Folder"); componentRoot.Name = COMPONENT_ROOT_NAME; componentRoot.Parent = Workspace; }

binder.bindDescendants(Workspace);

const mouse = player.GetMouse();

// Mode instances
const placementMode = new PlacementMode(previewService, binder, componentRoot, mouse);
const deleteMode = new DeleteMode(componentRoot, ComponentUI);
const wiringMode = new WiringMode(componentRoot, ComponentUI);
const cutWireMode = new CutWireMode(componentRoot, ComponentUI, wiringMode);
const moveMode = new MoveMode(componentRoot, previewService, mouse);

// UI helpers
function updateIndicator() {
	if (!modeIndicator) return;
	if (deleteMode.isActive()) { modeIndicator.Text = "DELETE MODE"; modeIndicator.Visible = true; return; }
	if (cutWireMode.isActive()) { modeIndicator.Text = "CUT MODE"; modeIndicator.Visible = true; return; }
	if (wiringMode.isActive()) { modeIndicator.Text = "WIRING MODE"; modeIndicator.Visible = true; return; }
	if (placementMode.isActive()) { modeIndicator.Text = "PLACING"; modeIndicator.Visible = true; return; }
	if (moveMode.isActive()) { modeIndicator.Text = "MOVING"; modeIndicator.Visible = true; return; }
	modeIndicator.Visible = false;
}
function syncDeleteButton() {
	if (!deleteButtonRef) return;
	const active = deleteMode.isActive();
	deleteButtonRef.Text = active ? "Exit Delete" : "Delete";
	deleteButtonRef.BackgroundColor3 = active ? new Color3(0.5,0,0) : new Color3(0.15,0.15,0.15);
}
function syncWireButton() {
	if (!wireButtonRef) return;
	const active = wiringMode.isActive();
	wireButtonRef.Text = active ? "Exit Wiring" : "Wire";
	wireButtonRef.BackgroundColor3 = active ? new Color3(0,0.3,0.6) : new Color3(0.15,0.15,0.15);
}
function syncCutButton() { if (!cutWireButtonRef) return; const active = cutWireMode.isActive(); cutWireButtonRef.Text = active ? "Exit Cut" : "CutWire"; cutWireButtonRef.BackgroundColor3 = active ? new Color3(0.6,0.3,0) : new Color3(0.15,0.15,0.15); }
function syncMoveButton() {
	if (!moveButtonRef) return;
	const active = moveMode.isActive();
	moveButtonRef.Text = active ? "Exit Move" : "Move";
	moveButtonRef.BackgroundColor3 = active ? new Color3(0.4, 0.4, 0.4) : new Color3(0.15, 0.15, 0.15);
}

function exitAllModes() {
	placementMode.cancel();
	deleteMode.exit();
	wiringMode.exit();
	cutWireMode.exit();
	moveMode.exit();
	syncDeleteButton(); syncWireButton(); syncCutButton(); syncMoveButton(); updateIndicator();
}

function activateDelete() {
	if (deleteMode.isActive()) { deleteMode.exit(); }
	else { exitAllModes(); deleteMode.enter(); }
	syncDeleteButton(); updateIndicator();
}
function activateWiring() {
	if (wiringMode.isActive()) { wiringMode.exit(); }
	else { exitAllModes(); wiringMode.enter(); }
	syncWireButton(); updateIndicator();
}
function activateCut() {
	if (cutWireMode.isActive()) cutWireMode.exit();
	else { exitAllModes(); cutWireMode.enter(); }
	syncCutButton(); updateIndicator();
}
function activateMove() {
	if (moveMode.isActive()) {
		moveMode.exit();
	} else {
		exitAllModes();
		moveMode.enter();
	}
	syncMoveButton();
	updateIndicator();
}
function startPlacing(component: Model) {
	if (deleteMode.isActive() || wiringMode.isActive() || cutWireMode.isActive() || moveMode.isActive()) return;
	placementMode.start(component);
	updateIndicator();
}
function confirmPlacement() { placementMode.confirm(); updateIndicator(); }

function initUI() {
	const deleteButton = ComponentUI.FindFirstChild("Delete");
	if (deleteButton && deleteButton.IsA("TextButton")) {
		deleteButtonRef = deleteButton;
		deleteButton.MouseButton1Click.Connect(() => activateDelete());
		syncDeleteButton();
	}
	const wireButton = ComponentUI.FindFirstChild("Wire");
	if (wireButton && wireButton.IsA("TextButton")) {
		wireButtonRef = wireButton; wireButton.MouseButton1Click.Connect(() => activateWiring()); syncWireButton();
	}
	const cutBtn = ComponentUI.FindFirstChild("CutWire");
	if (cutBtn && cutBtn.IsA("TextButton")) {
		cutWireButtonRef = cutBtn;
		cutWireButtonRef.MouseButton1Click.Connect(() => activateCut()); syncCutButton();
	}
	const moveButton = ComponentUI.FindFirstChild("Move");
	if (moveButton && moveButton.IsA("TextButton")) {
		moveButtonRef = moveButton;
		moveButton.MouseButton1Click.Connect(() => activateMove());
		syncMoveButton();
	}
	let existing = ComponentUI.FindFirstChild("ModeIndicator");
	if (existing && existing.IsA("TextLabel")) modeIndicator = existing; else {
		const label = new Instance("TextLabel"); label.Name = "ModeIndicator"; label.Size = new UDim2(1,0,0,24); label.Position = new UDim2(0,0,0,-24); label.BackgroundTransparency = 1; label.TextScaled = true; label.TextColor3 = new Color3(1,0.2,0.2); label.Visible = false; label.Parent = ComponentUI; modeIndicator = label;
	}
	for (const component of repo.getAll()) {
		const button = new Instance("TextButton"); button.Name = component.Name; button.Text = component.Name; button.Parent = frame;
		button.MouseButton1Click.Connect(() => { startPlacing(component as Model); });
	}
	updateIndicator();
}

// Input handling
mouse.Button1Down.Connect(() => {
	const cam = Workspace.CurrentCamera; if (!cam) return;
	if (deleteMode.isActive()) { deleteMode.onClick(mouse, cam); return; }
	if (cutWireMode.isActive()) { cutWireMode.onClick(mouse, cam); return; }
	if (wiringMode.isActive()) { wiringMode.onClick(mouse, cam); return; }
	if (moveMode.isActive()) { moveMode.onClick(mouse, cam); return; }
	if (placementMode.isActive()) { confirmPlacement(); return; }
});
UserInputService.InputBegan.Connect((input) => {
	if (input.KeyCode === Enum.KeyCode.Q) {
		if (deleteMode.isActive() || wiringMode.isActive() || moveMode.isActive()) exitAllModes(); else placementMode.cancel();
		updateIndicator(); syncDeleteButton(); syncWireButton();
	}
	if (input.KeyCode === Enum.KeyCode.Escape) { exitAllModes(); }
});

initUI();

// Heartbeat loops
RunService.Heartbeat.Connect(() => { const cam = Workspace.CurrentCamera; if (!cam) return; deleteMode.onHeartbeat(mouse, cam); });
RunService.Heartbeat.Connect(() => { const cam = Workspace.CurrentCamera; if (!cam) return; wiringMode.onHeartbeat(mouse, cam); });
RunService.Heartbeat.Connect(() => { const cam = Workspace.CurrentCamera; if (!cam) return; cutWireMode.onHeartbeat(mouse, cam); });

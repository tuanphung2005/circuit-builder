const Players = game.GetService("Players");
const workspace = game.GetService("Workspace");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const RunService = game.GetService("RunService");

// CONFIG
// up 1 stud because im stupid
const offset = new Vector3(0, 1, 0);

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");

const ComponentUI = playerGui.WaitForChild("ComponentUI");
const frame = ComponentUI.WaitForChild("Frame");

const UserInputService = game.GetService("UserInputService");

// get all child in replicated storage/components
const components = ReplicatedStorage.WaitForChild("Components");
const componentList = components.GetChildren();

// print("Components found:", componentList);

let isPlacing = false;
const mouse = player.GetMouse();
// mouse.hit.Position

let currentPreview: Model | undefined;
let previewConn: RBXScriptConnection | undefined;
let selectedComponent: Model | undefined;

function destroyPreview() {
    // destroy all previews
    const previews = workspace.GetChildren().filter(child => {
        const result = string.find(child.Name, "Preview_");
            return result !== undefined && result[0] === 1;
    });
    for (const preview of previews) {
        // print(" DEBUG destroying preview:", preview.Name);
        preview.Destroy();
    }
}

function placeComponent(component: Model) {
    const placedComponent = component.Clone() as Model;
    placedComponent.Parent = workspace;
    placedComponent.PivotTo(new CFrame(mouse.Hit.Position.add(offset)));
}

for (const component of componentList) {
    // create a button for each component
    const button = new Instance("TextButton");
    button.Name = component.Name;
    button.Text = component.Name;
    button.Size = new UDim2(1, 0, 0, 50);
    button.Parent = frame;

    // connect the button click event
    button.MouseButton1Click.Connect(() => {

        // cancel previous placement if any
        if (isPlacing) {
            previewConn?.Disconnect();
            previewConn = undefined;
            currentPreview?.Destroy();
            currentPreview = undefined;
            destroyPreview();
        }

        // when clicked, show the grid, and preview the component placement, user can click again to confirm placement
        isPlacing = true;
        selectedComponent = component as Model;

        // show preview
        const previewComponent = (component as Model).Clone();
        previewComponent.Name = "Preview_" + component.Name;
        previewComponent.Parent = workspace;
        currentPreview = previewComponent;
        
        // update preview position with offset
        previewConn = RunService.Heartbeat.Connect(() => {
            const mousePos = mouse.Hit.Position.add(offset);
            previewComponent.PivotTo(new CFrame(mousePos));
        });
    });
}

// place on left click
mouse.Button1Down.Connect(() => {
    if (!isPlacing || !currentPreview) return;

    isPlacing = false;
    previewConn?.Disconnect();
    previewConn = undefined;

    currentPreview.Name = selectedComponent ? selectedComponent.Name : currentPreview.Name;

    currentPreview = undefined;
    selectedComponent = undefined;
});

// cancel placing
UserInputService.InputBegan.Connect((input) => {
    if (input.KeyCode === Enum.KeyCode.Q) {
        if (isPlacing) {
            isPlacing = false;
            previewConn?.Disconnect();
            previewConn = undefined;
            currentPreview = undefined;
            selectedComponent = undefined;
            // print(" DEBUG placement cancelled");
            destroyPreview();
        }
        
    }
});
const Players = game.GetService("Players");
const workspace = game.GetService("Workspace");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const RunService = game.GetService("RunService");

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

function destroyPreview() {
    // destroy all previews
    const previews = workspace.GetChildren().filter(child => {
        const result = string.find(child.Name, "Preview_");
            return result !== undefined && result[0] === 1;
    });
    for (const preview of previews) {
        print(" DEBUG destroying preview:", preview.Name);
        preview.Destroy();
    }
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
            destroyPreview();
        }

        // when clicked, show the grid, and preview the component placement, user can click again to confirm placement
        print(" DEBUG previewing component:", component.Name);
        isPlacing = true;

        // show preview
        const previewComponent = component.Clone() as Model;
        previewComponent.Name = "Preview_" + component.Name;
        previewComponent.Parent = workspace;
        
        RunService.Heartbeat.Connect(() => {
            const mousePos = mouse.Hit.Position;
            // place preview at mouse position
            previewComponent.PivotTo(new CFrame(mousePos));
        })
        
    });
}

// cancel placing
UserInputService.InputBegan.Connect((input) => {
    if (input.KeyCode === Enum.KeyCode.Q) {
        if (isPlacing) {
            isPlacing = false;
            print(" DEBUG placement cancelled");
            destroyPreview();
        }
        
    }
});
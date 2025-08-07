const Players = game.GetService("Players");
const workspace = game.GetService("Workspace");
const ReplicatedStorage = game.GetService("ReplicatedStorage");

const player = Players.LocalPlayer;
const mouse = player.GetMouse();
const playerGui = player.WaitForChild("PlayerGui");

const ComponentUI = playerGui.WaitForChild("ComponentUI");
const frame = ComponentUI.WaitForChild("Frame");

// get all child in replicated storage/components
const components = ReplicatedStorage.WaitForChild("Components");
const componentList = components.GetChildren();

// print("Components found:", componentList);


for (const component of componentList) {
    // create a button for each component
    const button = new Instance("TextButton");
    button.Name = component.Name;
    button.Text = component.Name;
    button.Size = new UDim2(1, 0, 0, 50);
    button.Parent = frame;

    // connect the button click event
    button.MouseButton1Click.Connect(() => {
        // when clicked, show the grid, and preview the component placement, user can click again to confirm placement
        print("Previewing component:", component.Name);
    });
}
import { PlacementController } from "client/controllers/PlacementController.client";

export class KeybindManager {
    private controller: PlacementController;

    constructor(controller: PlacementController) {
        this.controller = controller;
        this.initializeKeybinds();
    }

    private initializeKeybinds() {
        const UserInputService = game.GetService("UserInputService");

        UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
            if (gameProcessedEvent) return;

            switch (input.KeyCode) {
                case Enum.KeyCode.One:
                    //
                    this.controller.activateWiring();
                    break;
                case Enum.KeyCode.Two:
                    this.controller.activateMove();
                    break;
                case Enum.KeyCode.Three:
                    this.controller.activateDelete();
                    break;
                case Enum.KeyCode.Four:
                    this.controller.activateCut();
                    break;
            }
        });
    }
}

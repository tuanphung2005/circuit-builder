import { ComponentKind } from "shared/components/types";

export function getComponentOutput(model: Model, isInputPowered: (part: BasePart) => boolean): boolean {
    const kind = model.Name as ComponentKind;
    const inputParts = model.GetChildren().filter((c): c is BasePart => c.IsA("BasePart") && c.Name.sub(1, 2) === "In");

    if (inputParts.size() === 0) {
        const active = model.GetAttribute("Active");
        return active === true;
    }

    let inputsPowered: boolean;
    switch (kind) {
        case ComponentKind.And:
            inputsPowered = inputParts.every((p) => isInputPowered(p));
            break;
        default:
            inputsPowered = inputParts.some((p) => isInputPowered(p));
            break;
    }

    const prevPowered = model.GetAttribute("Powered");
    if (prevPowered !== inputsPowered) {
        model.SetAttribute("Powered", inputsPowered);
    }

    // special handling for NOT gate
    switch (kind) {
        case ComponentKind.Not:
            return !inputsPowered;
        default:
            return inputsPowered;
    }
}
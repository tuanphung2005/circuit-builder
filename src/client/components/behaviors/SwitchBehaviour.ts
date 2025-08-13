import { ComponentKind } from "shared/components/types";
import { wireService } from "client/services/WireService";

export function isSwitch(model: Model) {
    return model.Name === ComponentKind.Switch || model.Name === ComponentKind.Switch.upper();
}

export function wireSwitch(model: Model) {
    if (!isSwitch(model)) return;
    let clickDetector = model.FindFirstChildWhichIsA("ClickDetector", true) as ClickDetector;

    let hl = model.FindFirstChild("Highlight");
    if (!hl || !hl.IsA("Highlight")) {
        hl = new Instance("Highlight");
        hl.Name = "Highlight";
        hl.Parent = model;
    }
    const highlight = hl as Highlight;
    let active = false;

    const apply = () => {
        highlight.OutlineTransparency = active ? 0 : 1;
        highlight.FillTransparency = active ? 0.5 : 1;
        // apply the same color as the brick color to highlight
        const base = model.FindFirstChild("Base");
        if (base && base.IsA("BasePart")) {
            highlight.FillColor = base.Color;
        }
        wireService.notifyOutputChanged(model, active);
    };

    apply();

    clickDetector.MouseClick.Connect(() => {
        active = !active;
        apply();
    });
}

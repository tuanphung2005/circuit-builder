import { ComponentKind } from "shared/components/types";
import { wireService } from "client/services/WireService";

export function isNot(model: Model) {
    return model.Name === ComponentKind.Not || model.Name === ComponentKind.Not.upper();
}

export function wireNot(model: Model) {
    if (!isNot(model)) return;

    const apply = () => {
        const powered = model.GetAttribute("Powered") === true;
    }
    apply();
    model.GetAttributeChangedSignal("Powered").Connect(apply);
}
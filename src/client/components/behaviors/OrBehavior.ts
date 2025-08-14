import { ComponentKind } from "shared/components/types";

export function isOr(model: Model) {
	return model.GetAttribute("ComponentKind") === ComponentKind.Or;
}

export function wireOr(model: Model) {
    if (!isOr(model)) return;
    const apply = () => {
            const powered = model.GetAttribute("Powered") === true;
        };

    apply();
    model.GetAttributeChangedSignal("Powered").Connect(apply);
}
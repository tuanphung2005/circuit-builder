import { ComponentKind } from "shared/components/types";

export function isXnor(model: Model) {
	return model.Name === ComponentKind.Xnor || model.Name === ComponentKind.Xnor.upper();
}

export function wireXnor(model: Model) {
	if (!isXnor(model)) return;
	const apply = () => {
		const powered = model.GetAttribute("Powered") === true;
	};
	apply();
	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

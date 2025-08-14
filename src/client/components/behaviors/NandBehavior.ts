import { ComponentKind } from "shared/components/types";

export function isNand(model: Model) {
	return model.Name === ComponentKind.Nand || model.Name === ComponentKind.Nand.upper();
}

export function wireNand(model: Model) {
	if (!isNand(model)) return;
	const apply = () => {
		const powered = model.GetAttribute("Powered") === true;
	};
	apply();
	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

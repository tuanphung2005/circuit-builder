import { ComponentKind } from "shared/components/types";

export function isNor(model: Model) {
	return model.Name === ComponentKind.Nor || model.Name === ComponentKind.Nor.upper();
}

export function wireNor(model: Model) {
	if (!isNor(model)) return;
	const apply = () => {
		const powered = model.GetAttribute("Powered") === true;
	};
	apply();
	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

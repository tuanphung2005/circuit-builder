import { ComponentKind } from "shared/components/types";

export function isXor(model: Model) {
	return model.Name === ComponentKind.Xor || model.Name === ComponentKind.Xor.upper();
}

export function wireXor(model: Model) {
	if (!isXor(model)) return;
	const apply = () => {
		const powered = model.GetAttribute("Powered") === true;
	};
	apply();
	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

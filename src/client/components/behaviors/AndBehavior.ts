import { ComponentKind } from "shared/components/types";
import { wireService } from "client/services/WireService";

export function isAnd(model: Model) {
	return model.Name === ComponentKind.And || model.Name === ComponentKind.And.upper();
}

// AND gate: has In1, In2 (optionally more 'In*') parts and an Out part.
// Out is powered if every input part is powered (wireService sets model Powered attribute already).
export function wireAnd(model: Model) {
	if (!isAnd(model)) return;
	const apply = () => {
		const powered = model.GetAttribute("Powered") === true;
	};
	apply();
	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

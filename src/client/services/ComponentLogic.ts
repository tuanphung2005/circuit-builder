import { ComponentKind } from "shared/components/types";

export function getComponentOutput(model: Model, isInputPowered: (part: BasePart) => boolean): boolean {
	const kind = model.Name as ComponentKind;
	const inputParts = model.GetChildren().filter(
		(c): c is BasePart => c.IsA("BasePart") && (c.Name === "In" || c.Name.sub(1, 2) === "In"),
	);

	if (inputParts.size() === 0) {
		const active = model.GetAttribute("Active");
		return active === true;
	}

	const poweredCount = inputParts.filter((p) => isInputPowered(p)).size();

	// Determine the "base" powered state before any inversion
	let basePowered: boolean;
	switch (kind) {
		case ComponentKind.And:
		case ComponentKind.Nand: // Base is AND
			basePowered = poweredCount === inputParts.size();
			break;
		case ComponentKind.Xor:
		case ComponentKind.Xnor: // Base is XOR
			basePowered = poweredCount % 2 === 1;
			break;
		case ComponentKind.Or:
		case ComponentKind.Nor: // Base is OR
		case ComponentKind.Not: // Base is OR (single input)
		default:
			basePowered = poweredCount > 0;
			break;
	}

	// Update the visual "Powered" attribute
	const prevPowered = model.GetAttribute("Powered");
	if (prevPowered !== basePowered) {
		model.SetAttribute("Powered", basePowered);
	}

	// Determine the final output by inverting if necessary
	switch (kind) {
		case ComponentKind.Not:
		case ComponentKind.Nand:
		case ComponentKind.Nor:
		case ComponentKind.Xnor:
			return !basePowered;
		default:
			return basePowered;
	}
}

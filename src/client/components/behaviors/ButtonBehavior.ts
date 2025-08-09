import { ComponentKind } from "shared/components/types";

export function isButton(model: Model) {
	return model.Name === ComponentKind.Button || model.Name === ComponentKind.Button.upper();
}

export function wireButton(model: Model) {
	if (!isButton(model)) return;
	let clickDetector = model.FindFirstChildWhichIsA("ClickDetector", true);
	if (!clickDetector) {
		// create one on primary part if missing
		const primary = model.PrimaryPart || (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
		if (primary) {
			clickDetector = new Instance("ClickDetector");
			clickDetector.Parent = primary;
		}
	}
	if (!clickDetector) return;

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
	};
	apply();
	clickDetector.MouseClick.Connect(() => {
		active = !active;
		apply();
		// print(` DEBUG toggled ${model.Name} -> ${active}`);
	});
}

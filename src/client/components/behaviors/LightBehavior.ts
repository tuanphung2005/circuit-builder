import { ComponentKind } from "shared/components/types";

export function isLight(model: Model) {
	return model.Name === ComponentKind.Light || model.Name === ComponentKind.Light.upper();
}

export function wireLight(model: Model) {
	if (!isLight(model)) return;
	const base = model.PrimaryPart || (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
	if (!base) return;

	let light = base.FindFirstChildWhichIsA("PointLight") as PointLight;
	if (!light) {
		const point = new Instance("PointLight");
		point.Enabled = false;
		point.Brightness = 10;
		point.Parent = base;
		light = point;
	}

	const apply = () => {
		const powered = model.GetAttribute("Powered") === true || model.GetAttribute("Active") === true;
		light.Enabled = powered;
	};
	apply();

	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

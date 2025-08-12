import { ComponentKind } from "shared/components/types";

export function isLight(model: Model) {
	return model.Name === ComponentKind.Light || model.Name === ComponentKind.Light.upper();
}

export function wireLight(model: Model) {
	if (!isLight(model)) return;
	const base = model.PrimaryPart || (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
	if (!base) return;

	const lightPart = model.WaitForChild("Light") as Part;
	const light = lightPart.FindFirstChildWhichIsA("PointLight") as PointLight;

	const apply = () => {
		const powered = model.GetAttribute("Powered") === true || model.GetAttribute("Active") === true;
		light.Brightness = powered ? 10 : 0;
		lightPart.Material = powered ? Enum.Material.Neon : Enum.Material.Plastic;
	};
	apply();

	model.GetAttributeChangedSignal("Powered").Connect(apply);
}

export enum ComponentKind {
	Button = "Button",
	Light = "Light",
	And = "And",
	Not = "Not",
	Switch = "Switch",
	Or = "Or",
	Xor = "Xor",
	Nand = "Nand",
	Nor = "Nor",
	Xnor = "Xnor",
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

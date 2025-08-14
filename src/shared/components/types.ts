export enum ComponentKind {
	Button = "Button",
	Light = "Light",
	And = "And",
	Not = "Not",
	Switch = "Switch",
	Or = "Or",
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

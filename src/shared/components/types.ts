export enum ComponentKind {
	Button = "Button",
	Light = "Light",
	And = "And",
	Not = "Not",
	Switch = "Switch",
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

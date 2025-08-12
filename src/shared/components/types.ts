export enum ComponentKind {
	Button = "Button",
	Light = "Light",
	And = "And",
	Not = "Not",
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

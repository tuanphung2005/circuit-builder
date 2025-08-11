export enum ComponentKind {
	Button = "Button",
	Light = "Light",
	And = "And",
	// Future: Switch = "Switch", Gate = "Gate" etc.
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

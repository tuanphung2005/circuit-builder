export enum ComponentKind {
	Button = "Button",
	// Switch = "Switch", Lamp = "Lamp" etc.
}

export interface ComponentMetadata {
	kind: ComponentKind;
	displayName: string;
	description?: string;
}

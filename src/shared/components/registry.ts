import { ComponentKind, ComponentMetadata } from "shared/components/types";

export const ComponentRegistry: Record<string, ComponentMetadata> = {
	Button: {
		kind: ComponentKind.Button,
		displayName: "Button",
		description: "A simple toggle button component.",
	},
	Light: {
		kind: ComponentKind.Light,
		displayName: "Light",
		description: "A simple point light that lit upon being powered",
	},
	And: {
		kind: ComponentKind.And,
		displayName: "And",
		description: "Outputs power only when all inputs are powered.",
	},
	Not: {
		kind: ComponentKind.Not,
		displayName: "Not",
		description: "Outputs power only when the input is not powered.",
	},
	Switch: {
		kind: ComponentKind.Switch,
		displayName: "Switch",
		description: "A simple switch component that toggles power.",
	}
};

export function getComponentMetadata(name: string): ComponentMetadata | undefined {
	return ComponentRegistry[name];
}

export function listComponents(): ComponentMetadata[] {
	const arr = new Array<ComponentMetadata>();
	for (const [key, value] of pairs(ComponentRegistry)) {
		arr.push(value as ComponentMetadata);
	}
	return arr;
}

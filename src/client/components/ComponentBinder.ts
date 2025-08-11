import { wireButton, isButton } from "client/components/behaviors/ButtonBehavior";
import { wireLight, isLight } from "client/components/behaviors/LightBehavior";
import { wireAnd, isAnd } from "client/components/behaviors/AndBehavior";

export type BehaviorWireFn = (model: Model) => void;

interface BehaviorEntry {
	predicate: (model: Model) => boolean;
	wire: BehaviorWireFn;
}

export class ComponentBinder {
	private entries = new Array<BehaviorEntry>();
	private wired = new WeakSet<Model>();

	constructor() {
		this.entries.push({ predicate: isButton, wire: wireButton });
		this.entries.push({ predicate: isLight, wire: wireLight });
		this.entries.push({ predicate: isAnd, wire: wireAnd });
	}

	bind(model: Model) {
		if (this.wired.has(model)) return;
		for (const entry of this.entries) {
			if (entry.predicate(model)) {
				entry.wire(model);
				this.wired.add(model);
				break;
			}
		}
	}

	bindDescendants(container: Instance) {
		for (const child of container.GetChildren()) if (child.IsA("Model")) this.bind(child);
	}
}

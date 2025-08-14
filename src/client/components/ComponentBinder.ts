import { wireButton, isButton } from "client/components/behaviors/ButtonBehavior";
import { wireLight, isLight } from "client/components/behaviors/LightBehavior";
import { wireAnd, isAnd } from "client/components/behaviors/AndBehavior";
import { wireNot, isNot } from "client/components/behaviors/NotBehavior";
import { wireSwitch, isSwitch } from "client/components/behaviors/SwitchBehaviour";
import { wireOr, isOr } from "client/components/behaviors/OrBehavior";
import { wireXor, isXor } from "client/components/behaviors/XorBehavior";
import { wireNand, isNand } from "client/components/behaviors/NandBehavior";
import { wireNor, isNor } from "client/components/behaviors/NorBehavior";
import { wireXnor, isXnor } from "client/components/behaviors/XnorBehavior";

let nextComponentId = 1;
function assignId(model: Model) {
	if (model.GetAttribute("ComponentId") === undefined) {
		model.SetAttribute("ComponentId", nextComponentId++);
	}
}

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
		this.entries.push({ predicate: isNot, wire: wireNot });
		this.entries.push({ predicate: isSwitch, wire: wireSwitch });
		this.entries.push({ predicate: isOr, wire: wireOr });
		this.entries.push({ predicate: isXor, wire: wireXor });
		this.entries.push({ predicate: isNand, wire: wireNand });
		this.entries.push({ predicate: isNor, wire: wireNor });
		this.entries.push({ predicate: isXnor, wire: wireXnor });
	}

	bind(model: Model) {
		if (this.wired.has(model)) return;
		assignId(model);
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

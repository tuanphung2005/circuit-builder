interface ConnectionRecord {
	outputPart: BasePart;
	inputPart: BasePart;
	beam: Beam;
	key: string;
}

import { getComponentOutput } from "./ComponentLogic";

export class WireService {
	private outputState = new Map<Model, boolean>();
	private connectionsByOutput = new Map<Model, ConnectionRecord[]>();
	private connectionsByInputPart = new Map<BasePart, ConnectionRecord[]>();
	private inputPartPowered = new Map<BasePart, boolean>();
	private connections = new Map<string, ConnectionRecord>();
	private idCounter = 1000; // fallback id allocator if binder missed
	private readonly ACTIVE_WIDTH = 0.2;
	private readonly INACTIVE_WIDTH = 0.1;

	private ensureModelId(model: Model): number {
		let id = model.GetAttribute("ComponentId") as number | undefined;
		if (id === undefined) {
			id = this.idCounter++;
			model.SetAttribute("ComponentId", id);
		}
		return id;
	}

	addConnection(outputPart: BasePart, inputPart: BasePart, beam: Beam) {
		const outModel = outputPart.FindFirstAncestorOfClass("Model");
		const inModel = inputPart.FindFirstAncestorOfClass("Model");
		if (!outModel || !inModel || outModel === inModel) return;
		const outId = this.ensureModelId(outModel);
		const inId = this.ensureModelId(inModel);
		const key = `${outId}:${outputPart.Name}->${inId}:${inputPart.Name}`;
		if (this.connections.has(key)) return; // already exists
		const record: ConnectionRecord = { outputPart, inputPart, beam, key };
		this.connections.set(key, record);
		const list = this.connectionsByOutput.get(outModel) || []; list.push(record); this.connectionsByOutput.set(outModel, list);
		const listIn = this.connectionsByInputPart.get(inputPart) || []; listIn.push(record); this.connectionsByInputPart.set(inputPart, listIn);
		const active = this.outputState.get(outModel) ?? false;
		// initialize beam visual + input power if active
		this.applyBeamVisual(record.beam, active);
		if (active) this.setInputPartPowered(inputPart, true);
		this.evaluateModel(inModel);
	}

	removeConnectionsForEndpoint(endpoint: BasePart): string[] {
		const removedKeys: string[] = [];
		const toRemove: ConnectionRecord[] = [];
		// collect records where endpoint is exactly the input part
		const inputList = this.connectionsByInputPart.get(endpoint);
		if (inputList) for (const rec of inputList) toRemove.push(rec);
		// collect records where endpoint is exactly the output part
		const outModel = endpoint.FindFirstAncestorOfClass("Model");
		if (outModel) {
			const outs = this.connectionsByOutput.get(outModel);
			if (outs) for (const rec of outs) if (rec.outputPart === endpoint) toRemove.push(rec);
		}
		if (toRemove.size() === 0) return removedKeys;
		for (const rec of toRemove) { if (!removedKeys.includes(rec.key)) { removedKeys.push(rec.key); this.deleteRecord(rec); } }
		const affectedInputs = new Set<BasePart>();
		for (const rec of toRemove) affectedInputs.add(rec.inputPart);
		for (const part of affectedInputs) { this.recomputeInputPart(part); const inModel = part.FindFirstAncestorOfClass("Model"); if (inModel) this.evaluateModel(inModel); }
		return removedKeys;
	}

	removeConnectionsForComponent(model: Model): string[] {
		const removed: string[] = [];
		// gather all records where model is output model
		const outList = this.connectionsByOutput.get(model);
		if (outList) for (const rec of outList) if (!removed.includes(rec.key)) { removed.push(rec.key); this.deleteRecord(rec); }
		// gather all records where model is input model
		for (const [_, rec] of this.connections) {
			const inModel = rec.inputPart.FindFirstAncestorOfClass("Model");
			if (inModel === model && !removed.includes(rec.key)) {
				removed.push(rec.key);
				this.deleteRecord(rec);
			}
		}
		// recompute inputs affected
		const affectedInputs = new Set<BasePart>();
		for (const key of removed) {
			const rec = this.connections.get(key); // will be undefined (already deleted), skip
			// can't recompute from rec, so alternative: recompute all inputs of model
		}
		// recompute all inputs belonging to any model (simple safe approach)
		// (could be optimized later) walk remaining input map
		for (const [inputPart] of this.connectionsByInputPart) {
			this.recomputeInputPart(inputPart); const inModel = inputPart.FindFirstAncestorOfClass("Model"); if (inModel) this.evaluateModel(inModel);
		}
		return removed;
	}

	private deleteRecord(rec: ConnectionRecord) {
		this.connections.delete(rec.key);
		if (rec.beam && rec.beam.Parent) rec.beam.Destroy();
		// remove from output map
		const outModel = rec.outputPart.FindFirstAncestorOfClass("Model");
		if (outModel) {
			const arr = this.connectionsByOutput.get(outModel);
			if (arr) this.connectionsByOutput.set(outModel, arr.filter(r => r !== rec));
		}
		// remove from input map
		const arrIn = this.connectionsByInputPart.get(rec.inputPart);
		if (arrIn) {
			const filtered = arrIn.filter(r => r !== rec);
			if (filtered.size() === 0) this.connectionsByInputPart.delete(rec.inputPart); else this.connectionsByInputPart.set(rec.inputPart, filtered);
		}
	}

	notifyOutputChanged(outModel: Model, active: boolean) {
		this.outputState.set(outModel, active);
		const records = this.connectionsByOutput.get(outModel);
		if (records) {
			for (const rec of records) {
				this.applyBeamVisual(rec.beam, active);
				this.setInputPartPowered(rec.inputPart, active || this.inputPartPowered.get(rec.inputPart) === true);
				if (!active) this.recomputeInputPart(rec.inputPart);
				const inModel = rec.inputPart.FindFirstAncestorOfClass("Model");
				if (inModel) this.evaluateModel(inModel);
			}
		}
	}

	private applyBeamVisual(beam: Beam, powered: boolean) {
		beam.Width0 = powered ? this.ACTIVE_WIDTH : this.INACTIVE_WIDTH;
		beam.Width1 = powered ? this.ACTIVE_WIDTH : this.INACTIVE_WIDTH;
		beam.Color = powered ? new ColorSequence(new Color3(0,1,0.3)) : new ColorSequence(new Color3(0,1,1));
		beam.Transparency = powered ? new NumberSequence(0) : new NumberSequence(0.15);
	}

	private recomputeInputPart(inputPart: BasePart) {
		const records = this.connectionsByInputPart.get(inputPart);
		if (!records || records.size() === 0) { this.inputPartPowered.set(inputPart, false); return; }
		for (const rec of records) {
			const outModel = rec.outputPart.FindFirstAncestorOfClass("Model");
			if (outModel && this.outputState.get(outModel)) { this.inputPartPowered.set(inputPart, true); return; }
		}
		this.inputPartPowered.set(inputPart, false);
	}

	private setInputPartPowered(part: BasePart, powered: boolean) { this.inputPartPowered.set(part, powered); }

	private evaluateModel(model: Model) {
		// const nameLower = model.Name.lower();
		// const inputParts = model.GetChildren().filter(c => c.IsA("BasePart") && (c.Name === "In" || c.Name.sub(1,2) === "In")) as BasePart[];
		// if (inputParts.size() === 0) return; // no inputs => treat as source handled elsewhere
		// let powered: boolean;
		// // and gate
		// if (nameLower === "and") {
		// 	powered = inputParts.every(p => this.inputPartPowered.get(p) === true);
		// } else {
		// 	powered = inputParts.some(p => this.inputPartPowered.get(p) === true);
		// }
		// // previous state transfer
		// const prev = model.GetAttribute("Powered");
		// if (prev !== powered) {
		// 	model.SetAttribute("Powered", powered);
		// }
		// // not gate
		// let outputPowered = powered;
		// if (nameLower === "not") {
		// 	outputPowered = !powered;
		// }
		const isInputPowered = (part: BasePart) => this.inputPartPowered.get(part) === true;
		const outputPowered = getComponentOutput(model, isInputPowered);
		this.notifyOutputChanged(model, outputPowered);
	}
}

export const wireService = new WireService();

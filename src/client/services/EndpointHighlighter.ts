export class EndpointHighlighter {
	private componentRoot: Folder;
	private uiParent: Instance;
	private highlights: Highlight[] = [];

	constructor(componentRoot: Folder, uiParent: Instance) {
		this.componentRoot = componentRoot;
		this.uiParent = uiParent;
	}


	showAll() {
		this.hideAll();

		for (const component of this.componentRoot.GetChildren()) {
			if (component.IsA("Model")) {
				for (const child of component.GetChildren()) {
					if (child.IsA("BasePart")) {
						const isInput = child.Name === "In" || child.Name.sub(1, 2) === "In";
						const isOutput = child.Name === "Out";

						if (isInput || isOutput) {
							const h = new Instance("Highlight");
							h.FillTransparency = 1;
							h.OutlineTransparency = 0.4;
							h.DepthMode = Enum.HighlightDepthMode.Occluded;
							h.Adornee = child;
							h.Parent = this.uiParent;

							if (isInput) {
								h.OutlineColor = new Color3(0.2, 0.7, 1);
							} else {
								h.OutlineColor = new Color3(1, 0.7, 0.2);
							}
							this.highlights.push(h);
						}
					}
				}
			}
		}
	}

	hideAll() {
		for (const h of this.highlights) {
			h.Destroy();
		}
		this.highlights = [];
	}
}

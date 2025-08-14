export class ClickDetectorManager {
	private componentRoot: Folder;
	private originalDistances = new Map<ClickDetector, number>();

	constructor(componentRoot: Folder) {
		this.componentRoot = componentRoot;
	}
	disableAll() {
		this.originalDistances.clear();
		for (const component of this.componentRoot.GetChildren()) {
			if (component.IsA("Model")) {
				const clickDetector = component.FindFirstChildWhichIsA("ClickDetector", true);
				if (clickDetector) {
					this.originalDistances.set(clickDetector, clickDetector.MaxActivationDistance);
					clickDetector.MaxActivationDistance = 0;
				}
			}
		}
	}
	enableAll() {
		for (const [clickDetector, distance] of this.originalDistances) {
			
			if (clickDetector && clickDetector.Parent) {
				clickDetector.MaxActivationDistance = distance;
			}
		}
		this.originalDistances.clear();
	}
}

export class ComponentRepository {
	private readonly storage: Folder;

	constructor(storage: Folder) {
		this.storage = storage;
	}

	getAll(): Instance[] {
		return this.storage.GetChildren();
	}
}

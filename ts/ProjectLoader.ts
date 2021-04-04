class ProjectLoader {
	file_path: string;

	constructor(file_path:string) {
		this.file_path = file_path;
	}

	getFilePath() {
		return this.file_path;
	}
}
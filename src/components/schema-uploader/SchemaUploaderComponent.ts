import { IComponentManager, ISource } from "basiscore";

export default class SchemaUploaderComponent implements IComponentManager {
  initializeAsync(): Promise<void> {
    //throw new Error("Method not implemented.");
    return Promise.resolve();
  }
  runAsync(source?: ISource): Promise<any> {
    //throw new Error("Method not implemented.");
    return Promise.resolve();
  }
}

import { IPartValue, ISource } from "basiscore";
import UploaderBaseComponent from "../uploader-base/UploaderBaseComponent";
import ISchemaUploaderOptions from "./ISchemaUploaderOptions";

export default class SchemaUploaderComponent extends UploaderBaseComponent {
  private options: ISchemaUploaderOptions;

  async initializeAsync(): Promise<void> {
    this.container.querySelector("[data-btn-submit]").remove();
    const settingObject = await this.owner.getAttributeValueAsync("options");
    settingObject ? (this.options = eval(settingObject)) : null;
    this.multiple = this.options.multiple ?? false;
    await super.initializeAsync();
  }

  runAsync(source?: ISource): Promise<any> {
    return Promise.resolve();
  }

  setValues(values: IPartValue[]) {
    // if (values && values.length == 1) {
    //   this.dateRange.datePickerInput.value = values[0].value;
    // }
    console.table(values);
  }

  getValuesForValidate() {
    return Object.getOwnPropertyNames(this.files)
      .map((x) => this.files[x])
      .filter((x) => !x.mustDelete)
      .map((x) => {
        return { title: x.title, size: x.size, type: x.type };
      });
  }

  public async getAddedValuesAsync(): Promise<IPartValue[]> {
    const l = new Array<FileReader>();
    const process = Object.getOwnPropertyNames(this.files)
      .map((x) => this.files[x])
      .filter((x) => x.data)
      .map((x) => {
        return new Promise<IFileValue>((resolve, reject) => {
          const reader = new FileReader();
          l.push(reader);
          reader.readAsDataURL(x.data);
          reader.onload = () =>
            resolve({
              content: reader.result,
              name: x.title,
              size: x.size,
              type: x.type,
            });
          reader.onerror = (error) => reject(error);
        });
      });
    let result: Array<IFileValue> = null;
    result = await Promise.all(process);
    // console.log(l);
    // while (l.some((x) => x.readyState === FileReader.LOADING)) {
    //   const currentDate = Date.now();
    //   console.log("d");
    // }

    const mustAdded = result.map((x) => {
      const retVal: IPartValue = {
        value: x,
      };
      return retVal;
    });

    return mustAdded.length > 0 ? mustAdded : null;
  }

  public getDeletedValuesAsync(
    baseValues: IPartValue[]
  ): Promise<IPartValue[]> {
    const mustDelete = Object.getOwnPropertyNames(this.files)
      .map((x) => this.files[x])
      .filter((x) => x.mustDelete)
      .map((x) => {
        const retVal: IPartValue = {
          id: x.id,
          value: x,
        };
        return retVal;
      });

    return Promise.resolve(mustDelete.length > 0 ? mustDelete : null);
  }
}

interface IFileValue {
  content: any;
  name: string;
  type: string;
  size: number;
}

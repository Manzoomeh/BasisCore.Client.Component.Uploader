import {
  IComponentManager,
  IDictionary,
  ISource,
  IUserDefineComponent,
} from "basiscore";
import layout from "./assets/layout.html";
import imageLayout from "./assets/image-layout.html";
import "./assets/style.css";
import ExtensionList from "../../ExtensionList";
import IFileInfo from "./IFileInfo";

export default abstract class UploaderBaseComponent
  implements IComponentManager
{
  protected readonly owner: IUserDefineComponent;
  protected multiple: boolean = false;

  protected readonly container: Element;
  protected files: IDictionary<IFileInfo>;
  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
    this.container = document.createElement("div");
    this.container.innerHTML = layout;
    this.owner.setContent(this.container);
    this.files = {};
  }

  initializeAsync(): Promise<void> {
    const input = this.container.querySelector<HTMLInputElement>(
      "[data-bc-uploader-input]"
    );
    input.addEventListener("change", (e) => {
      e.preventDefault();
      this.addFilesFromClient(input);
    });
    if (this.multiple) {
      input.setAttribute("multiple", "");
    }
    return Promise.resolve();
  }

  abstract runAsync(source?: ISource): Promise<any>;

  addFilesFromClient(input: HTMLInputElement) {
    const files = Array.from(input.files);
    files.forEach((file) => {
      const fileInfo: IFileInfo = {
        mustDelete: false,
        title: file.name,
        type: file.type,
        size: file.size,
        data: file,
      };
      if (ExtensionList[file.type] === null) {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(file);
        oFReader.onload = (e) => {
          fileInfo.image = e.target.result;
          this.addFileToUI(fileInfo);
        };
      } else {
        this.addFileToUI(fileInfo);
      }
    });
    input.value = "";
  }

  addFileToUI(file: IFileInfo) {
    const container = this.container.querySelector(
      "[data-bc-uploader-image-list]"
    );
    const template = imageLayout.replace("@title", file.title);
    const fileElement = this.owner.toNode(template).childNodes[0] as Element;
    const imageElement =
      fileElement.querySelector<HTMLImageElement>("[data-item-image]");
    const localId = this.owner.getRandomName("uploader_");
    this.files[localId] = file;
    (imageElement as any).src =
      file.image ?? ExtensionList[file.type] ?? ExtensionList["???"];
    fileElement
      .querySelector("[data-item-btn-delete]")
      .addEventListener("click", (e) => {
        e.preventDefault();
        if (file.id) {
          file.mustDelete = true;
        } else {
          delete this.files[localId];
        }
        fileElement.remove();
      });
    container.append(fileElement);
  }
}

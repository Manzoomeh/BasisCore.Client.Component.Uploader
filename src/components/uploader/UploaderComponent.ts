import {
  IComponentManager,
  IDictionary,
  ISource,
  IToken,
  IUserDefineComponent,
} from "basiscore";
import layout from "./assets/layout.html";
import imageLayout from "./assets/image-layout.html";
import "./assets/style.css";
import ExtensionList from "./ExtensionList";

export default class UploaderComponent implements IComponentManager {
  private readonly _owner: IUserDefineComponent;
  private _fileGetUrl: IToken<string>;
  private _filePostUrl: IToken<string>;
  private _multiple: boolean = false;
  private _run: boolean = false;
  private readonly _container: Element;
  private readonly _imageContainer: Element;
  private _files: IDictionary<IFileInfo>;
  constructor(owner: IUserDefineComponent) {
    this._owner = owner;
    this._container = document.createElement("div");
    this._container.innerHTML = layout;
    this._owner.setContent(this._container);
    this._imageContainer = this._container.querySelector(
      "[data-bc-uploader-image-list]"
    );
    this._container
      .querySelector("[data-btn-submit]")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.sendUserActionToServerAsync();
      });
  }

  initializeAsync(): Promise<void> {
    this._fileGetUrl = this._owner.getAttributeToken("file-get-url");
    this._filePostUrl = this._owner.getAttributeToken("file-post-url");
    this._multiple = this._owner.node.hasAttribute("multiple");
    return Promise.resolve();
  }

  private async sendUserActionToServerAsync(): Promise<void> {
    const files = Object.getOwnPropertyNames(this._files).map(
      (x) => this._files[x]
    );
    const mustDelete = files
      .filter((x) => x.mustDelete)
      .map((x) => `deleted=${x.id}`)
      .join("&");

    const mustAdd = files.filter((x) => x.data);
    if (mustDelete.length > 0 || mustAdd.length > 0) {
      const fd = new FormData();
      mustAdd.forEach((x) => {
        fd.append(x.title, x.data);
      });

      let url = await this._filePostUrl.getValueAsync();

      if (mustDelete) {
        url += `?${mustDelete}`;
      }

      const response = await fetch(url, {
        method: "post",
        body: fd,
      });

      if (response.status == 200) {
        await this.addFilesFromServerAsync();
      }
      console.log(response.status, await response.text());
    }
  }

  async runAsync(source?: ISource): Promise<any> {
    if (!this._run) {
      this._run = true;
      this.addFilesFromServerAsync();
      const input = this._container.querySelector<HTMLInputElement>(
        "[data-bc-uploader-input]"
      );
      input.addEventListener("change", (e) => {
        e.preventDefault();
        this.addFilesFromClient(input);
      });
      if (this._multiple) {
        input.setAttribute("multiple", "");
      }
    }
    return Promise.resolve();
  }

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
    const container = this._container.querySelector(
      "[data-bc-uploader-image-list]"
    );
    const template = imageLayout.replace("@title", file.title);
    const fileElement = this._owner.toNode(template).childNodes[0] as Element;
    const imageElement =
      fileElement.querySelector<HTMLImageElement>("[data-item-image]");
    const localId = this._owner.getRandomName("uploader_");
    this._files[localId] = file;
    (imageElement as any).src =
      file.image ?? ExtensionList[file.type] ?? ExtensionList["???"];
    fileElement
      .querySelector("[data-item-btn-delete]")
      .addEventListener("click", (e) => {
        e.preventDefault();
        const id = fileElement.getAttribute("data-item-server-id");
        if (file.id) {
          file.mustDelete = true;
        } else {
          delete this._files[localId];
        }
        fileElement.remove();
      });
    container.append(fileElement);
  }

  async addFilesFromServerAsync(): Promise<void> {
    this._files = {};
    this._container.querySelector("[data-bc-uploader-image-list]").innerHTML =
      "";
    if (this._fileGetUrl) {
      const url = await this._fileGetUrl.getValueAsync();
      var response = await fetch(url, { method: "GET" });
      const images: IFileInfo[] = await response.json();
      if (images) {
        const container = this._container.querySelector(
          "[data-bc-uploader-image-list]"
        );
        images.forEach((image) => this.addFileToUI(image));
      }
    }
  }
}

export interface IFileInfo {
  id?: string;
  title: string;
  image?: string | ArrayBuffer;
  type: string;
  url?: string;
  size: number;
  data?: File;
  mustDelete: boolean;
}

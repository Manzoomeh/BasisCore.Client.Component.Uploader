import { ISource, IToken } from "basiscore";
import IFileInfo from "../uploader-base/IFileInfo";
import UploaderBaseComponent from "../uploader-base/UploaderBaseComponent";

export default class UploaderComponent extends UploaderBaseComponent {
  private _fileGetUrl: IToken<string>;
  private _filePostUrl: IToken<string>;
  private _fileListLoadFromServer: boolean = false;

  initializeAsync(): Promise<void> {
    this._fileGetUrl = this.owner.getAttributeToken("file-get-url");
    this._filePostUrl = this.owner.getAttributeToken("file-post-url");
    this.multiple = this.owner.node.hasAttribute("multiple");

    this.container
      .querySelector("[data-btn-submit]")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.sendUserActionToServerAsync();
      });

    return super.initializeAsync();
  }

  private async sendUserActionToServerAsync(): Promise<void> {
    const files = Object.getOwnPropertyNames(this.files).map(
      (x) => this.files[x]
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
    if (!this._fileListLoadFromServer) {
      this._fileListLoadFromServer = true;
      await this.addFilesFromServerAsync();
    }
  }

  async addFilesFromServerAsync(): Promise<void> {
    this.files = {};
    this.container.querySelector("[data-bc-uploader-image-list]").innerHTML =
      "";
    if (this._fileGetUrl) {
      const url = await this._fileGetUrl.getValueAsync();
      var response = await fetch(url, { method: "GET" });
      const images: IFileInfo[] = await response.json();
      if (images) {
        const container = this.container.querySelector(
          "[data-bc-uploader-image-list]"
        );
        images.forEach((image) => this.addFileToUI(image));
      }
    }
  }
}

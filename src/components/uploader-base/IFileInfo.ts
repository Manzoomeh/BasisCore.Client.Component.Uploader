export default interface IFileInfo {
  id?: string;
  title: string;
  image?: string | ArrayBuffer;
  type: string;
  url?: string;
  size: number;
  data?: File;
  mustDelete: boolean;
}

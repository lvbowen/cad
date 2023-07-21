import { CKEditorUploadAdapter } from "../../type";


class UploadAdapter implements CKEditorUploadAdapter {

  loader: { file: Promise<File> };

  reader: FileReader | undefined;

  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return new Promise((resolve, reject) => {
      const reader = this.reader = new window.FileReader();

      reader.addEventListener('load', () => {
        resolve({ default: reader.result });
      });

      reader.addEventListener('error', err => {
        reject(err);
      });

      reader.addEventListener('abort', () => {
        reject();
      });

      this.loader.file.then(file => {
        reader.readAsDataURL(file);
      });
    });
  }

  abort() {
    this.reader?.abort();
  }

}

export default function UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => new UploadAdapter(loader);
}

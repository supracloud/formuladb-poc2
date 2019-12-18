export interface FrmdbBlob {
    url: string;
    fileName: string;
    blob: Blob;
    el?: HTMLElement;
    type: "image" | "video";
}
class Blobs {
    blobs: {[url: string]: FrmdbBlob} = {};

    addImgFile(file: File): FrmdbBlob {
        let frmdbBlob: FrmdbBlob = {
            url: URL.createObjectURL(file),
            blob: file,
            fileName: file.name,
            type: "image",
        };
        this.blobs[frmdbBlob.url] = frmdbBlob;
        return frmdbBlob;
    }

    addImgBlob(fileName: string, blob: Blob): FrmdbBlob {
        let frmdbBlob: FrmdbBlob = {
            url: URL.createObjectURL(blob),
            blob: blob,
            fileName,
            type: "image",
        };
        this.blobs[frmdbBlob.url] = frmdbBlob;
        return frmdbBlob;
    }

    removeBlob(blob: FrmdbBlob) {
        delete this.blobs[blob.url];
    }
}

export const BLOBS = new Blobs();

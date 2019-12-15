export interface FrmdbBlob {
    url: string;
    file: File;
    el?: HTMLElement;
    type: "image" | "video";
}
class Blobs {
    blobs: {[url: string]: FrmdbBlob} = {};

    addImgFile(file: File): FrmdbBlob {
        let frmdbBlob: FrmdbBlob = {
            url: URL.createObjectURL(file),
            file,
            type: "image",
        };
        this.blobs[frmdbBlob.url] = frmdbBlob;
        return frmdbBlob;
    }
}

export const BLOBS = new Blobs();

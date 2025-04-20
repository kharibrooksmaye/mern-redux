import { Meta } from "@uppy/core";

interface Specimen {
  user_id: string;
  encoded: string;
  thumb: string;
  info: Meta;
  recordId: string;
}
export interface Record {
  id: string;
  upload: boolean;
  specimens: Specimen[];
  specimensLength?: number;
  uploaded: boolean;
  userid: string;
  output?: any;
  createdAt: Date;
  updatedAt: Date;
}

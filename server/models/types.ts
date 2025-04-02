import mongoose from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}
export interface IDoc extends Document {
  user_id: string;
  encoded: string;
  thumb: string;
  recordId: string;
  info: Record<string, any>;
}

export interface IRecord extends Document {
  id: string;
  volume: number;
  upload: boolean;
  specimens?: any[];
  specimensLength?: number;
  uploaded: boolean;
  userid: string;
  output?: any[];
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  isActivated: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  "2fa": boolean;
  records?: any[];
  admin: boolean;
  authMethod: string;
  createdAt: Date;
  updatedAt: Date;
  generateVerificationToken: () => IToken;
}

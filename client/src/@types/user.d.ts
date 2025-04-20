export type User = {
  _id: string;
  id?: string;
  username: string;
  password: string;
  isActivated: boolean;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  "2fa": boolean;
  records: Array<Object>;
  admin: boolean;
  authMethod: string;
  subscribed: boolean;
  subscription: string;
  session: string;
  customerId: string;
} | null;

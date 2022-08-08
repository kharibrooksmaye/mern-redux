export type User = {
  id: string;
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
} | null;

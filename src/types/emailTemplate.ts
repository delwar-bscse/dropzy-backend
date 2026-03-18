export type ICreateAccount = {
    name: string;
    email: string;
    otp: number;
};
  
export type IResetPassword = {
    email: string;
    otp: number;
};

export type IContactSupport = {
  email: string;
  sub: string;
  msg: string;
  reply: string;
};
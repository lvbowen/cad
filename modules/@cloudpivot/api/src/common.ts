export interface LogoutParams {
  redirect_uri: string,
  access_token: string,
}

export interface Data {
  errcode?: number,
  errmsg?: string,
  data?: any,
}
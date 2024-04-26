export type AuthInfo = {
  // change name of this field, as it's currently a misnomer; or at least tri-valued
  authenticated: boolean;
  userId?: string;
  scope?: string;
  reason?: string;
  type?: "api_key" | "jwt",
  token?: string,
};


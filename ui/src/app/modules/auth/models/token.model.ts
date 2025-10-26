export default class Token {
  token: string | null = null;
  expiration: Date | null = null;
  refreshToken: string | null = null;
  expirationRefreshToken: Date | null = null;
}

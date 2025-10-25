export default class Token {
  token: string | null = null;
  expiracao: Date | null = null;
  refreshToken: string | null = null;
  expiracaoRefreshToken: Date | null = null;
}

import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {HttpClientTestingModule, HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import { environment } from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import { RegisterUser } from '@modules/auth/interfaces/register-user.interface';

describe(AuthService.name, () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should register a user', () => {
    const formData = new FormData();
    const mockResponse: RegisterUser = {
      name: '123',
      email: 'test@example.com',
      phone: '9999999999',
      password: 'Test@2025',
      confirmPassword: 'Test@2025'
    };

    service.register(formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/user`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('skip')).toBe('true');
    req.flush(mockResponse);
  });

  it('should login and return token', () => {
    const credentials = { identificacao: 'user', senha: 'pass' };
    const mockToken: Token = {
      token: 'abc123',
      refreshToken: 'def456',
      expiracao: new Date(Date.now()),
      expiracaoRefreshToken: new Date(Date.now() + 1000),
    };

    service.login(credentials).subscribe(token => {
      expect(token).toEqual(mockToken);
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockToken);
  });

  it('should refresh token', () => {
    const refreshToken = 'def456';
    const mockToken: Token = {
      token: 'newToken',
      refreshToken: 'newRefresh',
      expiracao: new Date(Date.now()),
      expiracaoRefreshToken: new Date(Date.now() + 1000),
    };

    service.refreshToken(refreshToken).subscribe(token => {
      expect(token).toEqual(mockToken);
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/refresh-token`);
    expect(req.request.body).toEqual({ refreshToken });
    req.flush(mockToken);
  });

  it('should send password recovery request', () => {
    const identificacao = 'user@example.com';

    service.recuperarSenha(identificacao).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/recuperar-senha`);
    expect(req.request.body).toEqual({ identificacao });
    req.flush(null);
  });

  it('should verify recovery code', () => {
    const dados = { codigo: '123456', email: 'user@example.com' };

    service.verificarCodigoRecuperacaoSenha(dados).subscribe(result => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/verificar-codigo`);
    expect(req.request.body).toEqual(dados);
    req.flush(true);
  });

  it('should change password', () => {
    const dados = { senha: 'newPass', confirmarSenha: 'newPass' };

    service.alterarSenha(dados).subscribe(result => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/alterar-senha`);
    expect(req.request.body).toEqual(dados);
    req.flush(true);
  });

  it('should store token in storage', () => {
    const expirationTime = new Date(123456);
    const refreshExpirationTime = new Date(123456 + 1000);
    const token: Token = {
      token: 'abc123',
      refreshToken: 'def456',
      expiracao: expirationTime,
      expiracaoRefreshToken: refreshExpirationTime,
    };

    service.setTokenInStorage(token);

    expect(sessionStorage.getItem('accessToken')).toBe('abc123');
    expect(sessionStorage.getItem('expiracao')).toBe(expirationTime.toString());
    expect(localStorage.getItem('refreshToken')).toBe('def456');
    expect(localStorage.getItem('expiracaoRefreshToken')).toBe(refreshExpirationTime.toString());
  });

  it('should clear token from storage', () => {
    sessionStorage.setItem('accessToken', 'abc123');
    sessionStorage.setItem('expiracao', '123456');
    localStorage.setItem('refreshToken', 'def456');
    localStorage.setItem('expiracaoRefreshToken', '654321');

    service.clearTokenFromStorage();

    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('expiracao')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('expiracaoRefreshToken')).toBeNull();
  });
});

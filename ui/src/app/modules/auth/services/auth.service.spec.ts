import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import { AuthService } from './auth.service';

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

  it('should authenticate and store token via tap', () => {
    const credentials = { email: 'user', password: 'pass' } as any;
    const mockToken: Token = new Token();
    mockToken.token = 'abc123';
    mockToken.refreshToken = 'def456';
    mockToken.expiration = new Date(Date.now());
    mockToken.expirationRefreshToken = new Date(Date.now() + 1000);

    service.authenticate(credentials).subscribe(token => {
      expect(token).toEqual(mockToken);
    });

    const req = httpMock.expectOne(`${apiUrl}/v1/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockToken);
  });
});

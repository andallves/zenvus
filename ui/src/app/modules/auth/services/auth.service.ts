import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {SignUpUser} from '@core/interfaces/signup-user.interface';
import {environment} from '@env/environment.development';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  register(userData: FormData): Observable<SignUpUser> {
    return this.httpClient.post<SignUpUser>(
      `${this.apiUrl}/user`,
      userData
    );
  }
}

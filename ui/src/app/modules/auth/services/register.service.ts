import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {RegisterUser} from '@modules/auth/interfaces/register-user.interface';
import {Observable, take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  registerUser(userData: FormData): Observable<RegisterUser> {
    console.log('Esta chegando no service de autenticação')
    return this.httpClient.post<RegisterUser>(
      `${this.apiUrl}/v1/user`,
      userData,
      {
        headers: new HttpHeaders().set('skip', 'true')
      }
    ).pipe(take(1));
  }
}

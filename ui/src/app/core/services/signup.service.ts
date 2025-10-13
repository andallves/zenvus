import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SignUpUser} from '../interfaces/signup-user.interface';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  private readonly apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);

  register(userData: FormData): Observable<SignUpUser> {
    return this.httpClient.post<SignUpUser>(
      `${this.apiUrl}/user`,
      userData
    );
  }
}

import { bootstrapApplication } from '@angular/platform-browser';
import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {providers} from './app/app.routes';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    ...providers,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ]
})
  .catch((err) => console.error(err));

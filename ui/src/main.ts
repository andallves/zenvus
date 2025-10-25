  import {bootstrapApplication, Title} from '@angular/platform-browser';
  import {TitleStrategy} from '@angular/router';
  import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
  import {TemplatePageTitleStrategy} from '@core/strategies/template-page-title.strategy ';
  import { appConfig } from './app/app.config';
  import { AppComponent } from './app/app.component';
  import {providers} from './app/app.routes';

  bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      ...providers,
      Title,
      { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
      JwtHelperService,
      { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },

    ]
  })
    .catch((err) => console.error(err));

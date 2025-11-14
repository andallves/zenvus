import { bootstrapApplication, Title } from '@angular/platform-browser';
import { TitleStrategy } from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { TemplatePageTitleStrategy } from '@core/strategies/template-page-title.strategy';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { providers } from './app/app.routes';
import './app/shared/open-telemetry/instrumentation';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    ...providers,
    Title,
    { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ],
}).catch(err => console.error(err));

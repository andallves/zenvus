import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { providers } from './app/app.routes';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...appConfig.providers, ...providers],
}).catch(err => console.error(err));

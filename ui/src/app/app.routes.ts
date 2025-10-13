import { Routes } from '@angular/router';
import {SignUpComponent} from './pages/sign-up/sign-up.component';
import {AuthLayout} from './shared/layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        component: SignUpComponent,
        title: 'Sign Up - Zenvus'
      },
    ]
  }
];

import { Routes } from '@angular/router';
import {
  UnauthenticatedCommonLayout
} from './core/layout/template/unauthenticated-common-layout/unauthenticated-common-layout';
import {SignUp} from './pages/sign-up/sign-up';

export const routes: Routes = [
  {
    path: '',
    component: UnauthenticatedCommonLayout,
    children: [
      {
        path: '',
        component: SignUp
      },
    ]
  }
];

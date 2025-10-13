import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginComponent} from '@modules/auth/pages/login/login.component';
import {RegisterComponent} from '@modules/auth/pages/register/register.component';

const routes: Routes = [
  {
    path: 'registro',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}

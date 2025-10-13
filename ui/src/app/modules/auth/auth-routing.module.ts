import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginComponent} from '@modules/auth/pages/login/login.component';
import {RegisterComponent} from '@modules/auth/pages/register/register.component';

const routes: Routes = [
  {
    path: 'cadastro',
    component: RegisterComponent,
    title: 'Cadastro',
    data: {
      description: 'Página de cadastro de novos usuários'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
    data: {
      description: 'Página de login de usuários'
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}

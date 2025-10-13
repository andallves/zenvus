import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthRoutingModule} from '@modules/auth/auth-routing.module';
import { LoginComponent } from '@modules/auth/pages/login/login.component';
import {InputPassword} from '@shared/components/form/input-password/input-password';
import {InputText} from '@shared/components/form/input-text/input-text';
import {PrimaryButton} from '@shared/components/primary-button/primary-button';
import {SecondaryButton} from '@shared/components/secondary-button/secondary-button';
import {UnauthenticatedCommonLayoutComponent} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    InputPassword,
    InputText,
    PrimaryButton,
    ReactiveFormsModule,
    SecondaryButton,
    UnauthenticatedCommonLayoutComponent
  ]
})
export class AuthModule { }


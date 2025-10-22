import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthRoutingModule} from '@modules/auth/auth-routing.module';
import { LoginComponent } from '@modules/auth/pages/login/login.component';
import {RegisterComponent} from '@modules/auth/pages/register/register.component';
import {InputPasswordComponent} from '@shared/components/form/input-password/input-password.component';
import {InputTextComponent} from '@shared/components/form/input-text/input-text.component';
import {MoneyLoadingComponent} from '@shared/components/money-loading/money-loading.component';
import {PrimaryButton} from '@shared/components/primary-button/primary-button.component';
import {SecondaryButton} from '@shared/components/secondary-button/secondary-button';
import {UnauthenticatedCommonLayoutComponent} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent
  ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        FormsModule,
        InputPasswordComponent,
        InputTextComponent,
        PrimaryButton,
        ReactiveFormsModule,
        SecondaryButton,
        UnauthenticatedCommonLayoutComponent,
        MoneyLoadingComponent
    ],
  exports: [
    RegisterComponent,
    LoginComponent
  ],
})
export class AuthModule { }


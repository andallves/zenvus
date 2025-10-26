import { FormControl } from '@angular/forms';

export interface RegisterUserForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}

export interface RegisterUser {
  name: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  confirmPassword: string | null;
}

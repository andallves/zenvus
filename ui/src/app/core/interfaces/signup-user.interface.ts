import { FormControl } from '@angular/forms';

export interface SignUpUser {
  Name: FormControl<string | null>;
  Email: FormControl<string | null>;
  Telephone: FormControl<string | null>;
  Password: FormControl<string | null>;
  ConfirmPassword: FormControl<string | null>;
}

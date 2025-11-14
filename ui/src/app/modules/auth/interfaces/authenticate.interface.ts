import {FormControl} from '@angular/forms';

export interface Authenticate {
  email: string;
  password: string;
}

export interface AuthenticateForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

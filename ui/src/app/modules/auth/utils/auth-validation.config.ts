import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';

export const REGISTER_VALIDATION_CONFIG: IFieldConfig[] = [
  {
    key: 'name',
    label: 'Nome',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 60,
    },
  },
  {
    key: 'email',
    label: 'Email',
    validation: {
      required: true,
      email: true,
    },
  },
  {
    key: 'phone',
    label: 'Telefone',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.phoneValidator()],
    },
  },
  {
    key: 'password',
    label: 'Senha',
    validation: {
      required: true,
      minLength: 8,
      maxLength: 30,
      customValidators: [
        ValidationHelperService.hasUpperCaseValidator,
        ValidationHelperService.hasNumberValidator,
        ValidationHelperService.hasSpecialCharacterValidator,
      ],
    },
  },
  {
    key: 'confirmPassword',
    label: 'Confirmar Senha',
    validation: {
      required: true,
      customValidators: [
        ValidationHelperService.passwordsMatchValidator('password', 'confirmPassword'),
      ],
    },
  },
];

export const LOGIN_VALIDATION_CONFIG: IFieldConfig[] = [
  {
    key: 'email',
    label: 'Email',
    validation: {
      required: true,
      email: true,
    },
  },
  {
    key: 'password',
    label: 'Senha',
    validation: {
      required: true,
      minLength: 8,
    },
  },
];

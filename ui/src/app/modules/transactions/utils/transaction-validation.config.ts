import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';

export const CATEGORY_VALIDATION_CONFIG: IFieldConfig[] = [
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
    key: 'color',
    label: 'Cor',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.colorHexValidator()],
    },
  },
  {
    key: 'type',
    label: 'Tipo',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.hasNumberValidator()],
    },
  },
];

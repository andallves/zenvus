import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';

export const INCOME_VALIDATION_CONFIG: IFieldConfig[] = [
  {
    key: 'description',
    label: 'Descrição',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 255,
    },
  },
  {
    key: 'amount',
    label: 'Valor',
    validation: {
      required: true,
      pattern: /^\d+(,\d{1,2})?$/,
    },
  },
  {
    key: 'categoryId',
    label: 'Categoria',
    validation: {
      required: true,
    },
  },
  {
    key: 'typeId',
    label: 'Tipo',
    validation: {
      required: true,
    },
  },
  {
    key: 'date',
    label: 'Data',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.dateValidator],
    },
  },
];

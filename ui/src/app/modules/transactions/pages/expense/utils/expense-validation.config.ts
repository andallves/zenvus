import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';

export const EXPENSE_VALIDATION_CONFIG: IFieldConfig[] = [
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
    key: 'categoryId',
    label: 'Categoria',
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
  {
    key: 'typeId',
    label: 'Tipo',
    validation: {
      required: true,
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
    key: 'isInstallment',
    label: 'Parcelado',
    validation: {
      required: true,
    },
  },
  {
    key: 'totalInstallments',
    label: 'Quantidade de parcelas',
    validation: {
      minLength: 1,
    },
  },
  {
    key: 'firstDueDate',
    label: 'Data da 1ª parcela',
    validation: {},
  },
];

export const DEBT_INSTALLMENT_VALIDATION_CONFIG: IFieldConfig[] = [
  {
    key: 'number',
    label: 'Parcela',
    validation: {
      required: true,
    },
  },
  {
    key: 'amount',
    label: 'Valor à Pagar',
    validation: {
      required: true,
    },
  },
  {
    key: 'amount',
    label: 'Valor Pago',
    validation: {
      required: true,
    },
  },
  {
    key: 'status',
    label: 'Status',
    validation: {
      required: true,
    },
  },
  {
    key: 'dueDate',
    label: 'Data de Vencimento',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.dateValidator],
    },
  },
  {
    key: 'paymentDate',
    label: 'Data de Pagamento',
    validation: {
      required: true,
      customValidators: [ValidationHelperService.dateValidator],
    },
  },
];

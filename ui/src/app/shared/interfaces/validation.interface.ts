import { ValidatorFn } from '@angular/forms';

export interface IValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  customValidators?: ValidatorFn[];
}

export interface IFieldConfig {
  key: string;
  label: string;
  validation?: IValidationRules;
}

export type IValidationConfig = Record<string, IFieldConfig>;

export interface IValidationBuilder {
  buildFormGroup(configs: IFieldConfig[], initialValues?: any): any;
  buildControl(config: IFieldConfig, initialValue?: any): any;
  getValidators(config: IFieldConfig): ValidatorFn[];
}

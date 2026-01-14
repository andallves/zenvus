// @shared/validators/validation-builder.service.ts
import { Injectable, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationHelperService } from './validation-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationBuilderService {
  private fb = inject(FormBuilder);

  /**
   * Converte IFieldConfig em validadores reais
   */
  buildValidators(config: IFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (!config.validation) return validators;

    const { validation } = config;

    // Validadores básicos do Angular
    if (validation.required) {
      validators.push(Validators.required);
    }
    if (validation.minLength) {
      validators.push(Validators.minLength(validation.minLength));
    }
    if (validation.maxLength) {
      validators.push(Validators.maxLength(validation.maxLength));
    }
    if (validation.pattern) {
      validators.push(Validators.pattern(validation.pattern));
    }
    if (validation.email) {
      validators.push(Validators.email);
    }

    // Validadores customizados
    if (validation.customValidators && validation.customValidators.length > 0) {
      validators.push(...validation.customValidators);
    }

    return validators;
  }

  /**
   * Cria um FormControl a partir de uma configuração
   */
  buildControl(config: IFieldConfig, initialValue: any = ''): any {
    const validators = this.buildValidators(config);
    return this.fb.control(initialValue, validators);
  }

  /**
   * Cria um FormGroup completo a partir de configurações
   */
  buildFormGroup(configs: IFieldConfig[], initialValues: any = {}): any {
    const groupConfig: any = {};

    configs.forEach(config => {
      groupConfig[config.key] = [initialValues[config.key] || '', this.buildValidators(config)];
    });

    return this.fb.group(groupConfig);
  }

  /**
   * Método auxiliar para adicionar validações a um form existente
   */
  addValidatorsToForm(form: any, configs: IFieldConfig[]): void {
    configs.forEach(config => {
      const control = form.get(config.key);
      if (control) {
        const validators = this.buildValidators(config);
        control.setValidators(validators);
        control.updateValueAndValidity();
      }
    });
  }
}

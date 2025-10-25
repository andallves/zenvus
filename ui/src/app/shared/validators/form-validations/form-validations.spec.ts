import { AbstractControl } from '@angular/forms';
import { FormValidations } from './form-validations';

describe(FormValidations.name, () => {
  function makeControl(options: {
    value?: any;
    errors?: any;
    touched?: boolean;
    rootValues?: Record<string, any>;
  }): AbstractControl {
    const { value, errors, touched = true, rootValues } = options;
    const control: Partial<AbstractControl> = {
      value,
      errors: errors === undefined ? null : errors,
      touched,
      root: {
        get(name: string) {
          return rootValues ? ({ value: rootValues[name] } as any) : undefined;
        },
      } as any,
    };

    return control as AbstractControl;
  }

  describe('equalTo', () => {
    it('should return null when values are equal (strings)', () => {
      const validator = FormValidations.equalTo('other');
      const control = makeControl({ value: 'abc', rootValues: { other: 'abc' } });
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return error when values are different', () => {
      const validator = FormValidations.equalTo('other');
      const control = makeControl({ value: 'a', rootValues: { other: 'b' } });
      const result = validator(control);
      expect(result).toEqual({ equalTo: true });
    });

    it('should return null when both are undefined', () => {
      const validator = FormValidations.equalTo('other');
      const control = makeControl({ value: undefined, rootValues: { } });
      const result = validator(control);
      // other field is undefined -> root.get('other') returns undefined
      // undefined === undefined -> should be considered equal -> null
      expect(result).toBeNull();
    });

    it('should return error when other field is undefined but value is defined', () => {
      const validator = FormValidations.equalTo('other');
      const control = makeControl({ value: 'x', rootValues: { } });
      const result = validator(control);
      expect(result).toEqual({ equalTo: true });
    });
  });

  describe('isInvalid', () => {
    it('should return undefined when formControl is null', () => {
      const res = FormValidations.isInvalid(null, 'required');
      expect(res).toBeUndefined();
    });

    it('should return undefined when errors is null', () => {
      const control = makeControl({ errors: null, touched: true });
      const res = FormValidations.isInvalid(control, 'required');
      expect(res).toBeUndefined();
    });

    it('should return error value when validator exists and touched is true', () => {
      const control = makeControl({ errors: { required: true }, touched: true });
      const res = FormValidations.isInvalid(control, 'required');
      expect(res).toBe(true);
    });

    it('should return false when validator exists but touched is false', () => {
      const control = makeControl({ errors: { required: true }, touched: false });
      const res = FormValidations.isInvalid(control, 'required');
      expect(res).toBe(false);
    });

    it('should return the error object (e.g., minlength) when present and touched is true', () => {
      const errorObj = { requiredLength: 3, actualLength: 1 };
      const control = makeControl({ errors: { minlength: errorObj }, touched: true });
      const res = FormValidations.isInvalid(control, 'minlength');
      expect(res).toEqual(errorObj);
    });

    it('should return undefined when validator key is not present', () => {
      const control = makeControl({ errors: { other: true }, touched: true });
      const res = FormValidations.isInvalid(control, 'required');
      expect(res).toBeUndefined();
    });
  });
});


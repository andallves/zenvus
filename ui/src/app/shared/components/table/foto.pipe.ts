import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'foto',
  standalone: true,
})
export class FotoPipe implements PipeTransform {
  transform(value: any): any {
    if (
      typeof value === 'string' &&
      (value.endsWith('.jpg') ||
        value.endsWith('.jpeg') ||
        value.endsWith('.png') ||
        value.endsWith('.svg'))
    ) {
      const sanitizedValue = encodeURI(value);
      return `<img src="${sanitizedValue}" alt="${sanitizedValue}" width="50px" height="50px">`;
    }
    return null;
  }
}

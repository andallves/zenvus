import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFilter } from '@shared/interfaces/filter.interface';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected convertToHttpParams(filters: IFilter<unknown>): HttpParams {
    let params = new HttpParams()
      .set('Page', filters.page?.toString() || '1')
      .set('ItemsPerPage', filters.itemsPerPage?.toString() || '10');

    Object.entries(filters).forEach(([key, value]) => {
      const isPaginationKey = key === 'page' || key === 'itemsPerPage';

      if (value !== null && value !== undefined && value !== '' && !isPaginationKey) {
        // Tratamento de tipos: Date para ISO, outros para String
        const formattedValue = value instanceof Date ? value.toISOString() : String(value);
        params = params.append(key, formattedValue);
      }
    });

    return params;
  }
}

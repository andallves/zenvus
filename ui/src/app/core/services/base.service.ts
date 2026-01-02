import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import { IExpense, IExpenseFilter } from '@shared/interfaces/expense.interface';
import { IFilter } from '@shared/interfaces/filter.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  protected readonly apiUrl = environment.apiUrl;
  protected readonly httpClient = inject(HttpClient);

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

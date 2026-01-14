import { Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import {
  IIncome,
  IIncomeRegister,
  IIncomeFilter,
  IIncomeUpdate,
} from '@shared/interfaces/income.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncomeService extends BaseService {
  getIncomes(filters: IIncomeFilter): Observable<ApiResponse<IIncome>> {
    const params = this.convertToHttpParams(filters);
    return this.httpClient.get<ApiResponse<IIncome>>(`${this.apiUrl}/v1/income`, { params });
  }

  register(data: IIncomeRegister): Observable<IIncome> {
    return this.httpClient.post<IIncome>(`${this.apiUrl}/v1/income`, data);
  }

  update(data: IIncomeUpdate, id: string): Observable<IIncome> {
    console.log(data);
    return this.httpClient.put<IIncome>(`${this.apiUrl}/v1/income/${id}`, data);
  }

  delete(id: string): Observable<IIncome> {
    return this.httpClient.delete<IIncome>(`${this.apiUrl}/v1/income/${id}`);
  }
}

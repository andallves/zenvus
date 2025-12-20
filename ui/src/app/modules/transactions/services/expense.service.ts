import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment.development';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import { IExpense, IExpenseFilter } from '@shared/interfaces/expense.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService extends BaseService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getExpenses(filters: IExpenseFilter): Observable<ApiResponse<IExpense>> {
    const params = this.convertToHttpParams(filters);
    return this.httpClient.get<ApiResponse<IExpense>>(`${this.apiUrl}/v1/expense`, { params });
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import { IExpense } from '@shared/interfaces/expense.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getExpenses(
    page: number,
    itensPorPagina: number,
    filtros: any = {}
  ): Observable<ApiResponse<IExpense>> {
    let params = new HttpParams().set('Page', page).set('ItemsPerPage', itensPorPagina);

    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.httpClient.get<ApiResponse<IExpense>>(`${this.apiUrl}/v1/expense`, { params });
  }
}

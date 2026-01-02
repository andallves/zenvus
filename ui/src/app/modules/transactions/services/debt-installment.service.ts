import { Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { IDebtInstallment, IDebtInstallmentUpdate } from '@shared/interfaces/debt.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebtInstallmentService extends BaseService {
  updateInstallment(data: IDebtInstallmentUpdate, id: string): Observable<IDebtInstallment> {
    return this.httpClient.put<IDebtInstallment>(`${this.apiUrl}/v1/expense/debt/${id}`, data);
  }
}

import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';

import { IDashboard, IDashboardFilter } from '@shared/interfaces/dashboard.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService {
  getSummary(filters: IDashboardFilter): Observable<IDashboard> {
    const params = new HttpParams()
      .set('Month', filters.month?.toString() || '')
      .set('Year', filters.year?.toString() || '');
    return this.httpClient.get<IDashboard>(`${this.apiUrl}/v1/dashboard/summary`, {
      params,
    });
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { environment } from '@env/environment';
import { IOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import {
  ICategory,
  ICategoryCreate,
  ICategoryEdit,
  ICategoryFilter,
} from '@shared/interfaces/category.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
class CategoryService extends BaseService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getCategoriesForSelect(isIdValue = true, type = ECategoryType.Expense): Observable<IOptions[]> {
    return this.httpClient.get<ApiResponse<ICategory>>(`${this.apiUrl}/v1/category`).pipe(
      map(response =>
        response.result
          .filter(category => !category.disabled && category.type === type)
          .map(cat => ({
            label: cat.name,
            value: isIdValue ? cat.id : cat.name,
          }))
      )
    );
  }

  getCategories(filters: ICategoryFilter): Observable<ApiResponse<ICategory>> {
    const params = this.convertToHttpParams(filters);
    return this.httpClient.get<ApiResponse<ICategory>>(`${this.apiUrl}/v1/category`, { params });
  }

  addCategory(data: ICategoryCreate): Observable<ICategory> {
    return this.httpClient.post<ICategory>(`${this.apiUrl}/v1/category`, data);
  }

  editCategory(data: ICategoryEdit, id: string): Observable<ICategory> {
    return this.httpClient.put<ICategory>(`${this.apiUrl}/v1/category/${id}`, data);
  }

  deleteCategory(id: string): Observable<ICategory> {
    return this.httpClient.delete<ICategory>(`${this.apiUrl}/v1/category/${id}`);
  }
}

export default CategoryService;

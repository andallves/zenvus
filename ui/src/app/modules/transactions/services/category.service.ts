import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ICategory } from '@shared/domain-types/category.type';
import { ApiResponse } from '@shared/interfaces/api-response.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getCategories(
    page: number,
    itensPorPagina: number,
    filtros: any = {}
  ): Observable<ApiResponse<ICategory>> {
    let params = new HttpParams().set('Page', page).set('ItemsPerPage', itensPorPagina);

    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.httpClient
      .get<ApiResponse<ICategory>>(`${this.apiUrl}/v1/category`, { params })
      .pipe(
        map(res => {
          console.log('response:  ' + res);
          return res;
        })
      );
  }

  addCategory(data: any): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/v1/administracao/cursos`, data);
  }

  editCategory(data: any, id: number | string): Observable<any> {
    return this.httpClient.put(`${environment.apiUrl}/v1/administracao/cursos/${id}`, data);
  }

  deleteCategory(id: number | string): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/v1/administracao/cursos/${id}`);
  }
}

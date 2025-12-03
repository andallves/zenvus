import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getCategories(page: number, itensPorPagina: number, filtros: any = {}): Observable<any> {
    let params = new HttpParams().set('Pagina', page).set('ItensPorPagina', itensPorPagina);

    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });

    return this.httpClient.get<any>(`${this.apiUrl}/v1/category`, { params }).pipe(
      map((res: any) => {
        res.resultado = res.resultado.map((item: any) => ({
          ...item,
        }));
        console.log(res);
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

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ProductsResponse } from '../interfaces/productos.interface';
import { map } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ProductsService {

  private readonly http = inject( HttpClient );
  private readonly ulr = environment.apiUrl;
  products = signal<ProductsResponse[]>([])

  getAll(){
    return this.http.get<ProductsResponse[]>(`${this.ulr}products`)
    .pipe(
      map( resp => resp ) );

  }

}

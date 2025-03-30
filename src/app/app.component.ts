import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';

import { DataViewModule } from 'primeng/dataview';
import { ButtonModule} from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ProductsService } from './products/services/products.service';
import { ProductsResponse } from './products/interfaces/productos.interface';
import { ProductsMapperInterface } from './products/interfaces/productosMapper.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, DataViewModule, TagModule, TableModule, CommonModule, ReactiveFormsModule, FormsModule, InputNumberModule, InputTextModule, InputGroupModule, InputGroupAddonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  form: FormGroup;
  searchTerm!: string;

  private readonly productsService = inject(ProductsService);
  products = signal<ProductsMapperInterface[]>([]);
  productsFiltered = signal<ProductsMapperInterface[]>([]);

  constructor() {
    this.form = new FormGroup({
      iva: new FormControl(null),
      subtotal: new FormControl(null),
      total: new FormControl(null),
      products: new FormArray([])
    });

  }

  ngOnInit() {
    this.load();

  }

  load(){
    this.productsService.getAll().subscribe({
      next: (resp)=>{
        if(resp){
          const respMapper = this.mapperToProducts(resp);
          this.products.set(respMapper);
          this.productsFiltered.set(this.products());
        }
      },
      error: (error)=>{
        console.log(error);
      }
    })
  }

  mapperToProducts(products: ProductsResponse[]): ProductsMapperInterface[]{

    return products.map( product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      active: true,
    }));

  }

  controlProduct(product: any){
    return new FormGroup({
      codigo: new FormControl(product.id),
      name: new FormControl(product.title),
      price: new FormControl(product.price),
      quantity: new FormControl(1),
    })
  }

  addProductToTable(product: any){
    this.productsform.push(this.controlProduct(product));
    const foundProduct = this.productsFiltered().find(p => p.id === product.id);
    if (foundProduct) {
         foundProduct.active = false;
    }
    this.caculateTotals();

  }

  caculateTotals() {
    let subtotal = 0;


    this.productsform.controls.forEach(control => {
      subtotal += control.value.price * control.value.quantity;
    });


    let totalIva = subtotal * 0.19;
    let totalAPagar = subtotal + totalIva;


    this.form.patchValue({
      subtotal: subtotal.toFixed(2),
      iva: totalIva.toFixed(2),
      total: totalAPagar.toFixed(2)
    });


    this.form.get('subtotal')?.disable();
    this.form.get('iva')?.disable();
    this.form.get('total')?.disable();
  }


  onDeleteTableRow(index: any, product: any){
    console.log(product);


    if (index >= 0 && index < this.productsform.length) {
      this.productsform.removeAt(index);
    }

    if (this.productsform.controls.length <= 0) {
      this.form.patchValue({
        subtotal: 0,
        iva: 0,
        total: 0
      });
    } else {
      this.caculateTotals();
    }

    const foundProduct = this.productsFiltered().find(p => p.id === product.codigo);
    if (foundProduct) {
         foundProduct.active = true;
    }

  }

  onSearchNameProduct($event: any){
    const searchTerm = $event.target.value.trim().toLowerCase();
    console.log(searchTerm);
    if(searchTerm){
      const productsFilter = this.products().filter( product => product.title.toLowerCase().includes(searchTerm) );
      this.productsFiltered.set(productsFilter);

    }else{
      this.productsFiltered.set(this.products());
    }

  }

  onSave(){
    if(this.form.invalid) return;

    console.log(this.form.getRawValue());

  }

  get productsform(){
    return this.form.get('products') as FormArray;
  }

}

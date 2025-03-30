export interface ProductsMapperInterface {
    id:          number;
    title:       string;
    price:       number;
    description: string;
    category:    Category;
    image:       string;
    active:       boolean;

}

export enum Category {
  Electronics = "electronics",
  Jewelery = "jewelery",
  MenSClothing = "men's clothing",
  WomenSClothing = "women's clothing",
}

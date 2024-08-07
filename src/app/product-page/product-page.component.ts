import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.scss'
})
export class ProductPageComponent implements OnInit{
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private route: ActivatedRoute = inject(ActivatedRoute);


    product: any = null;
    productHandle: string = '';
    isLoading: boolean = false;
    isRelatedProductsLoading: boolean = false;
    relatedProducts: any[] = [];
    selectedImage: string = '';
    selectedSize: string = 'S';
    selectedQuantity: number = 1;
    variants: any;
    addingToCart: boolean = false;

    ngOnInit(){
        this.isLoading = true;
        this.productHandle = this.route.snapshot.paramMap.get('handle') as string;
        this.medusa.retrieveProduct(this.productHandle).then(async (product: any) => {
            this.product = product.products[0];
            this.variants = this.product.variants.reduce((acc: any, variant: any) => {
                const amount = variant.prices.find((price: any) => price.variant_id === variant.id)?.amount || null;
                acc[variant.title] = {
                    id: variant.id,
                    inventory_quantity: variant.inventory_quantity,
                    amount: (amount / 100).toFixed(2)
                };
                return acc;
            }, {});

            console.log(this.variants);
            this.selectedImage = this.product.images[0].url;
            this.isRelatedProductsLoading = true;
            const { products }: { products: any[] } = await this.medusa.getProducts(this.product.collection.id,4);
            this.relatedProducts = products.map(product => {
                let variants = product.variants;
                let minPrice: number = Infinity;

                variants.forEach((v: any) => {
                    if (v.prices) {
                        v.prices.forEach((price: any) => {
                            if (price.amount < minPrice) {
                                minPrice = price.amount;
                            }
                        });
                    }
                });

                product.minPrice = (minPrice / 100).toFixed(2);
                return { id: product.id, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
            }).filter((product: any) => product.id !== this.product.id);
            this.isRelatedProductsLoading = false;
        })
    }

    increment(){
        this.selectedQuantity += 1;
    }

    decrement(){
        if(this.selectedQuantity > 1){
            this.selectedQuantity -= 1;
        }
    }

    addToCart(){
        this.addingToCart = true;
        if(this.variants[this.selectedSize] !== undefined && this.selectedQuantity <= this.variants[this.selectedSize].inventory_quantity)
        this.medusa.addToCart(this.variants[this.selectedSize].id, this.selectedQuantity).then(() => {
            this.addingToCart = false;
        });
    }

}

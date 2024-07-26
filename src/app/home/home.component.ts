import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { NgOptimizedImage } from '@angular/common'

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [NgOptimizedImage],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    collections: any[] = [];
    productsByCollection: { [key: string]: any[] } = {};
    newArrivals:any[] = [];

    ngOnInit(): void {
        this.medusa.getCollections().then(({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
            collections.forEach((collection: any) => {
                this.medusa.getProducts(collection.id).then(({ products }: { products: any[] }) => {
                    this.productsByCollection[collection.id] =
                        products.map(product => {
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
                            return {id: product.id,thumbnail: product.thumbnail, name: product.title, price: product.minPrice};
                        });
                });
            });
        });

        this.medusa.getAllProducts().then(({ products, limit, offset, count }: {products: any, limit: any, offset: any, count: any}) => {
            this.newArrivals =
            products.map((product: any) => {
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
                return {id: product.id,thumbnail: product.thumbnail, name: product.title, price: product.minPrice};
            });
          })

    }

}

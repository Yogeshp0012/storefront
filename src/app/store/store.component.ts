import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';

@Component({
    selector: 'app-store',
    standalone: true,
    imports: [],
    templateUrl: './store.component.html',
    styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    products: any[] = [];
    collections: any[] = [];

    ngOnInit(): void {
        this.medusa.getCollections().then(({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
            console.log(this.collections)
        });

        this.medusa.getAllProducts(12).then(({ products, limit, offset, count }: { products: any, limit: any, offset: any, count: any }) => {
            this.products =
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
                    return { id: product.id, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
                });
        })
    }
}

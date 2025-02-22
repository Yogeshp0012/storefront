import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { TitleService } from '../title.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly title: TitleService = inject(TitleService);

    collections: any[] = [];
    productsByCollection: { [key: string]: any[] } = {};
    newArrivals:any[] = [];
    isLoading: boolean = false;
    isLoadingProducts: boolean = false;

    ngOnInit(): void {
        this.isLoading = true;
        this.isLoadingProducts = true;
        this.title.setTitle("Vastragrah - Home");
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
                return {id: product.id,handle: product.handle,thumbnail: product.thumbnail, name: product.title, price: product.minPrice};
            });
            this.isLoading = false;
          })
        this.medusa.getCollections().then(async ({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
            const promises = collections.map(async (collection: any) => {
                const { products }: { products: any[] } = await this.medusa.getProducts(collection.id);

                this.productsByCollection[collection.id] = products.map(product => {
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
                    return { id: product.id,handle: product.handle, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
                });
            });

            await Promise.all(promises);
            this.isLoadingProducts = false;
        });
    }

}

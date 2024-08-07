import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-store',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './store.component.html',
    styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private route: ActivatedRoute = inject(ActivatedRoute);

    pageType: string = '';
    products: any[] = [];
    collections: any[] = [];
    isLoading: boolean = false;

    ngOnInit(): void {
        this.isLoading = true;
        this.pageType = this.route.snapshot.paramMap.get('type') as string;
        this.medusa.getCollections().then(({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
            if (this.pageType !== "all") {
                const collection = this.collections.find(collection => collection.handle === this.pageType);
                this.medusa.getProducts(collection.id).then(({ products }: { products: any[] }) => {
                    this.products =
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
                            return { id: product.id, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
                        });
                        this.isLoading = false;
                });
            }
        });
        if (this.pageType == "all") {
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
                    this.isLoading = false;
            })
        }
    }

    filterCollection(collectionId: string) {
        this.isLoading = true;
        this.products = [];
        if (collectionId === "all") {
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
                    this.isLoading = false;
            })
        }
        else {
            this.medusa.getProducts(collectionId).then(({ products }: { products: any[] }) => {
                this.products =
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
                        return { id: product.id, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
                    });
                    this.isLoading = false;
            });
        }
    }
}

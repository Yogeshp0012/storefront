import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TitleService } from '../title.service';

@Component({
    selector: 'app-store',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.scss'] // Corrected to 'styleUrls'
})
export class StoreComponent implements OnInit, OnDestroy {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private route: ActivatedRoute = inject(ActivatedRoute);

    pageType: string = '';
    products: any[] = [];
    collections: any[] = [];
    isLoading: boolean = false;
    openFilterMenu: boolean = false;
    private subscription: Subscription = new Subscription();
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - All Products")
        this.isLoading = true;
        this.subscription.add(
            this.route.params.subscribe(params => {
                this.pageType = params['type'];
                this.loadProducts();
            })
        );
        this.loadCollections();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private loadCollections(): void {
        this.medusa.getCollections().then(({ collections }: { collections: any[] }) => {
            this.collections = collections;
            this.loadProducts();
        });
    }

    private loadProducts(): void {
        if (this.pageType === "all") {
            this.loadAllProducts();
        } else {
            this.loadCollectionProducts(this.pageType);
        }
    }

    private loadAllProducts(): void {
        this.isLoading = true;
        this.medusa.getAllProducts(12).then(({ products }: { products: any[] }) => {
            this.products = this.mapProducts(products);
            this.isLoading = false;
        });
    }

    private loadCollectionProducts(collectionId: string): void {
        this.isLoading = true;
        const collection = this.collections.find(c => c.handle === collectionId);
        if (collection) {
            this.medusa.getProducts(collection.id).then(({ products }: { products: any[] }) => {
                this.products = this.mapProducts(products);
                this.isLoading = false;
            });
        } else {
            this.isLoading = false; // Handle the case where collection is not found
        }
    }

    private mapProducts(products: any[]): any[] {
        return products.map(product => {
            const minPrice = this.getMinPrice(product.variants);
            return {
                id: product.id,
                handle: product.handle,
                thumbnail: product.thumbnail,
                name: product.title,
                price: (minPrice / 100).toFixed(2)
            };
        });
    }

    private getMinPrice(variants: any[]): number {
        let minPrice: number = Infinity;
        variants.forEach(variant => {
            if (variant.prices) {
                variant.prices.forEach((price: any) => {
                    if (price.amount < minPrice) {
                        minPrice = price.amount;
                    }
                });
            }
        });
        return minPrice;
    }

    filterCollection(collectionId: string): void {
        this.isLoading = true;
        this.products = [];
        if (collectionId === "all") {
            this.loadAllProducts();
        } else {
            this.loadCollectionProducts(collectionId);
        }
    }
}

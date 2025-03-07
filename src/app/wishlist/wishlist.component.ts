import { Component, effect, inject, OnChanges, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { TitleService } from '../title.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-wishlist',
    imports: [RouterModule],
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
    private medusa: MedusaClientService = inject(MedusaClientService);
    private readonly title: TitleService = inject(TitleService);
    private router: Router = inject(Router);

    favourite: any = this.medusa.favourite;
    favouriteItems: any = [];
    filteredProducts: any = [];
    isLoading: boolean = false;

    constructor() {
        effect(() => {
            this.isLoading = true;
            this.favourite = this.medusa.favourite;
            this.favouriteItems = this.favourite();
            this.medusa.getAllProducts(25).then((data: any) => {
                const allProducts = data?.products || []; // Ensure products exist
                const favoriteProductHandles = this.favouriteItems || []; // Ensure favoriteItems exist

                const filteredProducts = allProducts.filter((product: any) =>
                    favoriteProductHandles.includes(product.handle)
                );

                this.filteredProducts = filteredProducts;
                this.isLoading = false;
            });
        })
    }

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - WishList");
    }

    removeFromWishlist(handle: string) {
        this.medusa.removeFromWishlist(handle);
    }

    removeAllFavourites() {
        this.medusa.removeAllFavourites();
    }


}

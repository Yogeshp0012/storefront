import { CommonModule } from '@angular/common';
import { Component, effect, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MedusaClientService } from '../medusa-client.service';

@Component({
    selector: 'app-navigation-bar',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent implements OnInit {
    private readonly router: Router = inject(Router);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    isScrolled = false;
    mobileMenu: boolean = false;
    isMenuOpen: boolean = false;
    user = this.medusa.user;
    showCart: boolean = false;
    openSearch: boolean = false;
    searchProducts: any[] = [];
    filteredProducts: any[] = [];
    searchString: string = '';
    tax: number = 0;
    cart: any = this.medusa.cart;
    favourite: any = this.medusa.favourite;
    isCartLoading: boolean = false;
    currentRoute: string = '';
    wishListLength: any = '';

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.pageYOffset > 0;
    }

    constructor() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.url;
            }
        });
        effect(() => {
            this.user = this.medusa.user;
            this.cart = this.medusa.cart;
            this.favourite = this.medusa.favourite;
            if (this.cart()) {
                this.tax = (this.cart().subtotal * 0.05) / (1 + 0.05);
            }
        })

    }

    ngOnInit() {
        this.medusa.getAllProducts(10).then(({ products, limit, offset, count }: { products: any, limit: any, offset: any, count: any }) => {
            this.searchProducts =
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
                    return { id: product.id, handle: product.handle, thumbnail: product.thumbnail, name: product.title, price: product.minPrice };
                });
            this.filteredProducts = this.searchProducts
        })
    }

    openMobileMenu() {
        this.mobileMenu = true;
        this.isMenuOpen = true;
    }

    openCart() {
        this.showCart = true;
    }

    closeCart() {
        this.showCart = false;
    }

    closeMobileMenu() {
        this.mobileMenu = false;
    }

    checkUser() {
        if (!this.user()) {
            this.router.navigate(['/login']);
        }
        else {
            this.router.navigate(['/account']);
        }
    }

    logout() {
        let that = this;
        this.medusa.logout().then(() => {
            that.router.navigate(['/']);
        });
    }

    onSearch() {
        this.filteredProducts = this.searchProducts.filter(product =>
            product.name.toLowerCase().includes(this.searchString.toLowerCase())
        );
    }

    goToWishList(){
        this.router.navigate(['/wishlist']);
    }

    removeItem(id: string) {
        this.isCartLoading = true;
        this.medusa.removeFromCart(id).then(() => {
            this.isCartLoading = false;
        });
    }
}

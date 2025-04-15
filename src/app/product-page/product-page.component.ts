import { Component, effect, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { TitleService } from '../title.service';
import { ClipboardModule, Clipboard  } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-product-page',
    imports: [RouterModule, CommonModule, ClipboardModule],
    templateUrl: './product-page.component.html',
    styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {
  private readonly medusa: MedusaClientService = inject(MedusaClientService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly title: TitleService = inject(TitleService);
  private readonly location: Location = inject(Location);
  private readonly clipboard: Clipboard = inject(Clipboard);

  clicked: boolean = false;
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
  isProductLoading: boolean = false;
  isAnAffiliate: boolean = false;
  tips: any[] = [];
  isModalOpen: boolean = false;
  openPopUp: boolean = false;
  affiliatePopup: boolean = false;
  user = this.medusa.user;
  affiliateId: string = '';

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productHandle = params['handle'];
      this.loadProduct();

      this.route.queryParams.subscribe(queryParams => {
        const affiliateId = queryParams['affiliateId'];
        if (affiliateId) {
          this.medusa.updateVisits(affiliateId, this.productHandle).subscribe((data) => {
            console.log(data);
          });
          localStorage.setItem("affiliateId", queryParams['affiliateId']);
        }
      });
    });
  }


  constructor(){
     effect(() => {
        console.log(this.user());
        this.medusa.getAffiliate(this.user().email).subscribe({
            next: (data: any) => {
                if (data.message) {
                    this.isAnAffiliate = true;
                }
            },
            error: () => { }
        })
     });
  }

  private loadProduct() {
    this.isProductLoading = true;
    this.isLoading = true;


    this.medusa.retrieveProduct(this.productHandle).then(async (product: any) => {
      if (product.products[0].metadata['styling-tips']) {
        let tipsArray = JSON.parse(product.products[0].metadata['styling-tips']);
        this.tips = tipsArray.map((tip: any) => {
          const key = Object.keys(tip)[0];
          const value = tip[key];
          return { name: key, value: value };
        });
      }
      this.product = product.products[0];
      this.title.setTitle("Vastragrah - " + this.product.title);
      this.variants = this.product.variants.reduce((acc: any, variant: any) => {
        const amount =
          variant.prices.find((price: any) => price.variant_id === variant.id)?.amount || null;
        acc[variant.title] = {
          id: variant.id,
          inventory_quantity: variant.inventory_quantity,
          amount: (amount / 100).toFixed(2),
        };
        return acc;
      }, {});
      console.log(this.variants);
      this.selectedImage = this.product.images[0].url;
      this.isProductLoading = false;
      this.isRelatedProductsLoading = true;

      const { products }: { products: any[] } = await this.medusa.getProducts(
        this.product.collection.id,
        4,
      );
      this.relatedProducts = products
        .map((product) => {
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
          return {
            id: product.id,
            handle: product.handle,
            thumbnail: product.thumbnail,
            name: product.title,
            price: product.minPrice,
          };
        })
        .filter((product: any) => product.id !== this.product.id);
      this.isRelatedProductsLoading = false;
    });
  }

  addToFav(){
    this.medusa.addToWishlist(this.user().email, this.productHandle);
  }

  increment() {
    this.selectedQuantity += 1;
  }

  decrement() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity -= 1;
    }
  }

  generateAffiliateLink(){
    this.medusa.getAffiliateLink(this.productHandle, this.user().email).subscribe((data) => {
        this.affiliatePopup = true;
        let url = this.getCurrentUrl();
        this.affiliateId = this.getCurrentUrl() + "?affiliateId=" +data.message;
    });
  }

  getCurrentUrl(): string {
    const currentUrl = this.location.path(); // Get the path
    const baseUrl = window.location.origin; // Get the base URL

    // Create a new URL object
    const url = new URL(currentUrl, baseUrl);

    // Set the search parameters to an empty string to remove them
    url.search = '';

    return url.toString(); // Return the modified URL
  }


  copyToClipboard(){
    this.clipboard.copy(this.affiliateId) ;
    this.clicked = true;
  }

  addToCart() {
    this.openPopUp = false;
    this.addingToCart = true;
    this.medusa.alreadyPresentInCart(this.variants[this.selectedSize].id).then((quantity) => {
        if(quantity !== null && quantity >= this.variants[this.selectedSize].inventory_quantity) {
            this.openPopUp = true;
            this.addingToCart = false
            return;
        }
        if (
            this.variants[this.selectedSize] !== undefined &&
            this.selectedQuantity <= this.variants[this.selectedSize].inventory_quantity
          ) {
            this.medusa.addToCart(this.variants[this.selectedSize].id, this.selectedQuantity).then(() => {
              this.addingToCart = false;
            });
          }
    }).catch((error) => {
        console.error("Error:", error);
    });
  }
}

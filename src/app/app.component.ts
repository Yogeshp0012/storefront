import { DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { MedusaClientService } from './medusa-client.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { TitleService } from './title.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavigationBarComponent, FooterComponent, RouterModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly router: Router = inject(Router);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly title: TitleService = inject(TitleService);

    ngOnDestroy() {
        alert(123);
      }

      clearLocalStorage() {
        localStorage.removeItem('affiliateData');
      }

    ngOnInit(): void {
        this.title.setTitle("Vastragrah");
        this.medusa.checkUserLoggedIn()
            .then((isLoggedIn: boolean) => {
                this.medusa.checkCart();
                if (isLoggedIn) {
                    this.medusa.getAllWishlistItems();
                }
            })
            .catch((error: any) => {
                console.log('Error checking user login:', error);
            });
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.renderer.setProperty(this.document.documentElement, 'scrollTop', 0);
                this.renderer.setProperty(this.document.body, 'scrollTop', 0);
            }
        });

    }
}

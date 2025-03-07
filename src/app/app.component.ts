import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
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
export class AppComponent implements OnInit {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly router: Router = inject(Router);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah");
        this.medusa.checkUserLoggedIn().then(() => {
            this.medusa.checkCart();
            this.medusa.getAllWishlistItems();
        });
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.renderer.setProperty(this.document.documentElement, 'scrollTop', 0);
                this.renderer.setProperty(this.document.body, 'scrollTop', 0);
            }
        });

    }
}

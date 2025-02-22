import { Component, inject } from '@angular/core';
import { TitleService } from '../../title.service';

@Component({
    selector: 'app-privacy-policy',
    imports: [],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - Privacy Policy")
    }
}

import { Component, inject } from '@angular/core';
import { TitleService } from '../../title.service';

@Component({
    selector: 'app-return-policy',
    imports: [],
    templateUrl: './return-policy.component.html',
    styleUrl: './return-policy.component.scss'
})
export class ReturnPolicyComponent {
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - Return & Refunds Policy")
    }
}

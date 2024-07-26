import { DOCUMENT } from '@angular/common';
import { inject, Injectable, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);

  scrollToTop(): void {
    this.renderer.setProperty(this.document.documentElement, 'scrollTop', 0);
    this.renderer.setProperty(this.document.body, 'scrollTop', 0);
  }
}

import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
    { path: 'about', loadComponent: () => import('./static/about/about.component').then(m => m.AboutComponent) },
    { path: 'contact', loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent) },
    { path: 'privacy-policy', loadComponent: () => import('./static/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
    { path: 'return-policy', loadComponent: () => import('./static/return-policy/return-policy.component').then(m => m.ReturnPolicyComponent) },
    { path: 'tnc', loadComponent: () => import('./static/tnc/tnc.component').then(m => m.TncComponent) },
    { path: 'faq', loadComponent: () => import('./static/faq/faq.component').then(m => m.FaqComponent) },
    { path: 'login', loadComponent: () => import('./sign-in/sign-in.component').then(m => m.SignInComponent) },
    { path: 'account', loadComponent: () => import('./account/account.component').then(m => m.AccountComponent) },
    { path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent) },
    { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
    { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'store/:type', loadComponent: () => import('./store/store.component').then(m => m.StoreComponent) },
    { path: 'product/:handle', loadComponent: () => import('./product-page/product-page.component').then(m => m.ProductPageComponent) },
    { path: 'order/:id', loadComponent: () => import('./order/order.component').then(m => m.OrderComponent) },
    { path: 'confirmOrder', loadComponent: () => import('./guest-track/guest-track.component').then(m => m.GuestTrackComponent) },
    { path: '**', redirectTo: '/' },
];

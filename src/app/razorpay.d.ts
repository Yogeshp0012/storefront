// razorpay.d.ts
declare global {
    interface Window {
        Razorpay: any; // You can replace 'any' with a more specific type if you know it
    }
}

export {};

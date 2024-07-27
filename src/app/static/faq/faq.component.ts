import { Component } from '@angular/core';

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss'
})
export class FaqComponent {
    accordionExpanded: boolean[] = [];
    questions = [{
        "id": 1,
        "question": "How do I track my order?",
        "answer": "We are using Delhivery as our shipping partner. Please go to the Delhivery portal and enter your order ID for delivery tracking details."
    }, {
        "id": 2,
        "question": "How long will it take for my order to arrive?",
        "answer": "All standard orders will be shipped in 1 to 2 days. Generally, it will take 3 to 7 days after that."
    },
    {
        "id": 3,
        "question": "What should I do if payment fails?",
        "answer": "In case of any failure in payment, please recheck the information you have provided, i.e., account details, billing address, and password (Net Banking). If your account has been debited even after payment failure, the refund will be processed within 8 business days. "
    },
    {
        "id": 4,
        "question": "How should I cancel my order?",
        "answer": "Go to 'My Orders' and cancel your order. Cancellation will be allowed before shipping only."
    },
    {
        "id": 5,
        "question": "Do you offer cash on delivery?",
        "answer": "Yes, The shipping charges and Extra ₹50 cod charges should be paid before hand."
    },
    {
        "id": 6,
        "question": "I was not available at home when the order arrived. What should be done?",
        "answer": "Please make sure you are available when you receive the order. In case you are not available, the package will be returned to us for re-shipping, charges will apply"
    },
    {
        "id": 7,
        "question": "What should I do if I get the wrong product or a defective product?",
        "answer": "Please reach out to us on Instagram or email us at support@vastragrah.co. Include your image and video of the product received. We will arrange the pickup with the right product."
    },
    {
        "id": 8,
        "question": "How do I take care of the garments?",
        "answer": "Please check the wash care guide."
    },
    {
        "id": 9,
        "question": "Can I get the delivery faster?",
        "answer": "Sorry, currently, we do not have a service to offer express delivery."
    },
    {
        "id": 10,
        "question": "I want to return the product. I didnt like it?",
        "answer": "Please be sure while placing the order. We will not accept the returns in this case."
    },

    ]

    toggleAccordion(index: number) {
        console.log(this.accordionExpanded);
        this.accordionExpanded[index] = !this.accordionExpanded[index];
    }
}

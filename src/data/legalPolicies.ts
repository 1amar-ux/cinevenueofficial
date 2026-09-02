export interface LegalSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    title: string;
    items?: string[];
    content?: string;
  }[];
  bullets?: string[];
}

export interface LegalPolicyDocument {
  id: "privacy" | "terms" | "refund" | "cookie" | "user-agreement";
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string;
  badge: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address?: string;
  };
  sections: LegalSection[];
}

export const PRIVACY_STATEMENT: LegalPolicyDocument = {
  id: "privacy",
  title: "CineVenue Privacy Statement",
  subtitle: "Commitment to Data Protection, DPDP Framework & Customer Transparency",
  effectiveDate: "27 August 2026",
  lastUpdated: "27 August 2026",
  badge: "DPDP (India) & Global Compliant",
  summary: "CineVenue respects your privacy and is committed to protecting the personal information entrusted to us. This statement explains how CineVenue collects, uses, stores, shares, and protects information when you access our services.",
  contact: {
    name: "CineVenue Privacy & Grievance Cell",
    email: "info.cinevenue@gmail.com",
    phone: "+91 84658 70811",
    website: "https://cinevenue.com",
    address: "Guntur, Andhra Pradesh, India — 522001"
  },
  sections: [
    {
      id: "sec-1",
      title: "1. About CineVenue",
      content: "CineVenue is an entertainment and digital platform that may provide services including:\n\nFor purposes of applicable data-protection law, CineVenue may act as the entity determining the purposes and means of processing personal data collected through its services.",
      bullets: [
        "Movie discovery and ticket booking",
        "Event discovery and ticket/pass booking",
        "Film and entertainment promotions",
        "Event publishing and management",
        "Customer accounts and profiles",
        "CineCoin rewards and loyalty services",
        "Offers and promotional campaigns",
        "Digital tickets, QR codes and booking confirmations",
        "Customer support and communications"
      ]
    },
    {
      id: "sec-2",
      title: "2. Information We May Collect",
      content: "Depending on the services you use, CineVenue may collect the following information categories:",
      subsections: [
        {
          title: "A. Account Information",
          items: [
            "Name",
            "Mobile number",
            "Email address",
            "Date of birth where required",
            "Login credentials or authentication information",
            "Profile information voluntarily provided by you"
          ]
        },
        {
          title: "B. Booking Information",
          content: "When you make a movie or event booking, we may collect:",
          items: [
            "Booking ID",
            "Movie or event details",
            "Theatre or venue information",
            "Selected seats, tickets or passes",
            "Booking date and time",
            "Transaction status",
            "Ticket information",
            "QR-code or digital-ticket information"
          ]
        },
        {
          title: "C. Payment Information",
          content: "Payments may be processed through authorised third-party payment service providers.\n\nCineVenue may receive information such as Payment status, Transaction reference, Payment method, Amount paid, and Refund status.\n\nCineVenue generally does not need to store your complete card, banking or other sensitive payment credentials when those details are processed directly by an authorised payment provider."
        },
        {
          title: "D. CineCoin Information",
          content: "If you participate in CineCoin, we may maintain information relating to CineCoin balance, earnings, redemptions, reward transactions, referral rewards, promotional rewards, booking-based rewards, expiry information, and transaction history.\n\nCineCoin is a CineVenue loyalty/reward unit and is not intended to function as cryptocurrency, legal tender, or a transferable financial asset."
        },
        {
          title: "E. Device and Technical Information",
          content: "We may automatically collect certain technical information, such as IP address, browser type, device type, operating system, application version, approximate location derived from technical information where applicable, log information, pages or features accessed, and crash and performance information."
        },
        {
          title: "F. Communications",
          content: "If you contact CineVenue, we may retain information contained in your communication, including customer-support requests, feedback, complaints, emails, messages, and other information voluntarily provided by you."
        }
      ]
    },
    {
      id: "sec-3",
      title: "3. How We Use Personal Information",
      content: "CineVenue may use personal information for legitimate and specified purposes, including:",
      bullets: [
        "Creating and maintaining user accounts",
        "Processing movie and event bookings",
        "Issuing digital tickets and passes",
        "Processing payments and refunds",
        "Providing booking confirmations",
        "Managing CineCoin rewards",
        "Preventing fraudulent or unauthorised transactions",
        "Providing customer support",
        "Communicating important service information",
        "Sending promotional communications where permitted",
        "Improving our website, application and services",
        "Personalising relevant service experiences",
        "Maintaining security and preventing misuse",
        "Maintaining transaction and business records",
        "Complying with applicable legal and regulatory requirements",
        "Resolving disputes and enforcing applicable terms"
      ]
    },
    {
      id: "sec-4",
      title: "4. Consent",
      content: "Where consent is required, CineVenue will seek consent in a clear and understandable manner.\n\nConsent should be freely given, specific, informed and unambiguous, consistent with applicable data-protection requirements. Where processing is based on consent, you may withdraw that consent, subject to applicable law and the consequences of withdrawal.\n\nWithdrawal of consent will not affect the lawfulness of processing carried out before withdrawal."
    },
    {
      id: "sec-5",
      title: "5. Information Sharing",
      content: "CineVenue may share relevant information with trusted service providers where reasonably necessary to provide our services, including:\n\n• Payment processors\n• Theatre partners\n• Event organisers\n• Ticketing and booking service providers\n• Cloud hosting providers\n• Email and communication providers\n• Analytics and technology service providers\n• Security and fraud-prevention providers\n• Customer-support providers\n\nWe aim to share only information reasonably necessary for the relevant purpose. CineVenue may also disclose information where required by applicable law, court order, governmental authority, or for the protection of CineVenue, its users, partners or the public."
    },
    {
      id: "sec-6",
      title: "6. Theatre and Event Partners",
      content: "When you book a movie or event through CineVenue, certain booking information may need to be shared with the relevant theatre, venue, event organiser or service provider to fulfil your booking. For example, a theatre or event organiser may need information necessary to verify your booking, admit you to the venue, validate your ticket or QR code, provide the booked service, or process booking-related support. Third-party partners may have their own privacy practices."
    },
    {
      id: "sec-7",
      title: "7. Payment Security",
      content: "Payments may be processed through authorised payment gateways and financial service providers.\n\nCineVenue does not intentionally request unnecessary payment credentials through ordinary customer-support channels.\n\nYou should never provide your password, OTP, PIN, CVV or similar authentication credentials to anyone claiming to represent CineVenue."
    },
    {
      id: "sec-8",
      title: "8. Cookies and Similar Technologies",
      content: "CineVenue may use cookies, local storage, pixels, SDKs and similar technologies to keep users signed in, maintain sessions, remember preferences, improve website performance, understand service usage, maintain security, and measure campaigns and service performance.\n\nWhere required, CineVenue will provide appropriate choices or notices regarding cookies and similar technologies."
    },
    {
      id: "sec-9",
      title: "9. Data Security",
      content: "CineVenue uses reasonable technical and organisational measures designed to protect personal information against unauthorised access, misuse, alteration, disclosure, loss or destruction. Security measures include encryption where appropriate, access controls, authentication mechanisms, secure application architecture, monitoring and logging, role-based administrative access, and regular security testing.\n\nHowever, no internet-based service can guarantee absolute security."
    },
    {
      id: "sec-10",
      title: "10. Data Retention",
      content: "CineVenue may retain personal information for as long as reasonably necessary to provide requested services, maintain booking and transaction records, provide customer support, maintain CineCoin records, prevent fraud and misuse, resolve disputes, meet legal, tax, accounting or regulatory requirements, and enforce agreements.\n\nWhen information is no longer reasonably required for a legitimate purpose, CineVenue may delete, anonymise or otherwise dispose of it in accordance with applicable requirements."
    },
    {
      id: "sec-11",
      title: "11. Children's Privacy",
      content: "CineVenue takes the privacy and safety of children seriously.\n\nWhere applicable law requires verifiable parental or lawful-guardian consent before processing a child's personal data, CineVenue will implement appropriate measures to obtain and verify such consent.\n\nUnder India's Digital Personal Data Protection (DPDP) framework, a child is an individual who has not completed 18 years of age, and the framework provides specific protections concerning children's personal data.\n\nCineVenue will not knowingly use children's personal information for purposes prohibited by applicable law. If you believe that personal information relating to a child has been provided to CineVenue improperly, please contact us immediately."
    },
    {
      id: "sec-12",
      title: "12. Your Privacy Rights",
      content: "Subject to applicable law, you may have rights relating to your personal information, including the ability to:",
      bullets: [
        "Request information about processing of your personal data",
        "Request correction of inaccurate information",
        "Request deletion or erasure where applicable",
        "Withdraw consent where processing is based on consent",
        "Raise a privacy-related grievance",
        "Exercise other rights available under applicable law"
      ]
    },
    {
      id: "sec-13",
      title: "13. Accuracy of Information",
      content: "You are responsible for providing accurate information when creating an account or making a booking. You should update your information when it changes so that CineVenue can provide services correctly and communicate important booking or account information."
    },
    {
      id: "sec-14",
      title: "14. Third-Party Services",
      content: "CineVenue may integrate with third-party services, websites, payment providers, analytics providers, communication services, theatres, venues and event organisers. CineVenue is not responsible for the independent privacy practices of third parties that operate their own services. We encourage users to review the applicable privacy policies of third-party services when using those services."
    },
    {
      id: "sec-15",
      title: "15. Promotional Communications",
      content: "CineVenue may send service-related communications such as booking confirmations, payment notifications, ticket information, refund updates, account notifications, security alerts, and important service announcements.\n\nWhere applicable and permitted by law, CineVenue may also send promotional communications about movies, events, offers, CineCoin promotions and other entertainment services. You may manage or opt out of promotional communications at any time."
    },
    {
      id: "sec-16",
      title: "16. Data Transfers",
      content: "CineVenue may use service providers or technology infrastructure located in India or other jurisdictions where permitted under applicable law. Where personal data is transferred or processed outside India, CineVenue will take steps required by applicable data-protection laws and regulations."
    },
    {
      id: "sec-17",
      title: "17. Data Breaches and Security Incidents",
      content: "If a personal-data breach occurs, CineVenue will take appropriate steps to investigate, contain and remediate the incident and provide notifications to affected individuals or authorities where required by applicable law."
    },
    {
      id: "sec-18",
      title: "18. Changes to This Privacy Statement",
      content: "CineVenue may update this Privacy Statement from time to time to reflect changes to our services, technology, applicable laws, data-processing practices, or security/operational improvements. The updated version will be published through the CineVenue website or application with a revised 'Last Updated' date."
    },
    {
      id: "sec-19",
      title: "19. Grievance and Privacy Contact",
      content: "If you have questions, concerns, requests or complaints relating to privacy or personal-data processing, you may contact CineVenue through our official privacy and customer-support channels.\n\nPrivacy / Grievance Contact:\nCineVenue\nIndia\n\nEmail: info.cinevenue@gmail.com\nPhone: +91 84658 70811\nWebsite: https://cinevenue.com\n\nCineVenue will make reasonable efforts to respond to privacy-related requests within the timeframes required by applicable law."
    },
    {
      id: "sec-20",
      title: "20. Acceptance",
      content: "By using CineVenue's website, application or services, you acknowledge that you have reviewed this Privacy Statement. Where applicable law requires consent, CineVenue will obtain consent through an appropriate mechanism rather than treating mere use of the service as consent."
    }
  ]
};

export const TERMS_AND_CONDITIONS: LegalPolicyDocument = {
  id: "terms",
  title: "CineVenue Terms & Conditions",
  subtitle: "Operating Rules, Booking Guidelines, Platform Eligibility & Mutual Obligations",
  effectiveDate: "27 August 2026",
  lastUpdated: "27 August 2026",
  badge: "Governing Terms & Conditions",
  summary: "These Terms & Conditions govern your access to and use of the CineVenue website, mobile applications, platforms, ticketing services, event services, CineCoin rewards programme and related services.",
  contact: {
    name: "CineVenue Legal & Operations",
    email: "info.cinevenue@gmail.com",
    phone: "+91 84658 70811",
    website: "https://cinevenue.com",
    address: "Guntur, Andhra Pradesh, India — 522001"
  },
  sections: [
    {
      id: "terms-1",
      title: "1. About CineVenue",
      content: "CineVenue is an entertainment and digital platform that may facilitate movie discovery and ticket booking, theatre and showtime discovery, event discovery and ticket/pass booking, event publishing and management, digital ticketing, QR-code ticket validation, promotional campaigns, CineCoin rewards, offers and discounts, and customer and organiser services. CineVenue may operate as a platform connecting customers with theatres, venues, event organisers and other service providers."
    },
    {
      id: "terms-2",
      title: "2. Eligibility",
      content: "You must provide accurate information when using CineVenue. Certain services may have additional age, parental-consent or eligibility requirements. Where applicable law requires parental or guardian consent, such consent must be obtained before using the relevant service."
    },
    {
      id: "terms-3",
      title: "3. User Account",
      content: "You may be required to create an account to access certain features. You are responsible for providing accurate information, keeping your login credentials secure, maintaining the confidentiality of your account, not allowing unauthorised persons to use your account, and notifying CineVenue immediately of suspected unauthorised access. CineVenue may suspend or restrict an account where there is reasonable evidence of fraud, abuse, security risks or violation of these Terms."
    },
    {
      id: "terms-4",
      title: "4. Movie Bookings",
      content: "When you book movie tickets through CineVenue:\n\n• You must select the correct theatre, movie, showtime and seats.\n• You are responsible for reviewing booking details before payment.\n• A booking is considered confirmed only after successful payment and confirmation by CineVenue or the relevant booking provider.\n• Availability may change before a booking is completed.\n• Theatre policies may apply in addition to CineVenue policies.\n\nOnce a booking is confirmed, the ticket and booking details should be checked carefully."
    },
    {
      id: "terms-5",
      title: "5. Event Bookings",
      content: "Events may be organised by independent event organisers. Event organisers may determine event schedule, venue, ticket/pass categories, prices, entry requirements, age restrictions, cancellation rules, and event-specific terms. CineVenue may facilitate the booking but may not be the organiser or producer of every event listed on the platform."
    },
    {
      id: "terms-6",
      title: "6. Ticket Delivery",
      content: "Tickets may be delivered through CineVenue account, Email, SMS, Application notifications, Downloadable digital tickets, QR codes, or other supported electronic methods. You should keep your ticket or QR code secure. A QR code or ticket may be treated as proof of booking and may be invalidated after successful entry."
    },
    {
      id: "terms-7",
      title: "7. Payment",
      content: "Payments may be processed through authorised third-party payment providers. You agree to provide valid payment information where required. A payment may be declined, reversed, delayed or cancelled due to circumstances including payment-provider failures, bank failures, technical issues, fraud detection, incorrect payment information, insufficient funds, or other circumstances outside CineVenue's reasonable control."
    },
    {
      id: "terms-8",
      title: "8. Booking Fees and Platform Charges",
      content: "CineVenue may charge applicable booking fees, convenience fees, platform fees, service charges, taxes, and event-specific charges. Applicable charges will be displayed before completion of the transaction where reasonably practicable."
    },
    {
      id: "terms-9",
      title: "9. Cancellations and Refunds",
      content: "Cancellation and refund eligibility depends on the type of booking, theatre policy, event organiser policy, cancellation time, payment status, applicable law, and specific terms displayed during booking. Please refer to CineVenue's Refund & Cancellation Policy for detailed rules."
    },
    {
      id: "terms-10",
      title: "10. CineCoin",
      content: "CineCoin is CineVenue's loyalty/reward unit. CineCoin:\n\n• Is not cryptocurrency\n• Is not legal tender\n• Is not intended to be a financial instrument\n• Cannot be exchanged for cash unless expressly permitted under an applicable promotion\n• Cannot be sold or traded\n• Cannot be transferred between users unless expressly enabled by CineVenue\n• Has no independent monetary value outside CineVenue's approved redemption system\n\nCineVenue may modify reward rates, earning rules, redemption rules, expiry periods and promotional conditions in accordance with applicable terms."
    },
    {
      id: "terms-11",
      title: "11. Offers and Promotions",
      content: "Offers, discounts and promotional campaigns may have additional conditions such as validity periods, user eligibility, minimum booking values, maximum discount limits, usage limits, theatre/event restrictions, and payment-method restrictions. CineVenue may withdraw or modify an offer where permitted by its terms."
    },
    {
      id: "terms-12",
      title: "12. User Conduct",
      content: "You must not:\n\n• Use CineVenue for unlawful purposes\n• Create fraudulent accounts or provide false information\n• Attempt to manipulate bookings or abuse offers/rewards\n• Attempt to duplicate or misuse tickets or resell tickets where prohibited\n• Interfere with CineVenue systems or attempt unauthorised access\n• Introduce malicious software or circumvent security mechanisms\n• Scrape or systematically copy CineVenue content without permission"
    },
    {
      id: "terms-13",
      title: "13. Intellectual Property",
      content: "CineVenue's software, branding, logos, designs, text, graphics and other original content are protected by applicable intellectual-property laws. You may not reproduce, modify, distribute or commercially exploit CineVenue intellectual property without appropriate permission. Third-party trademarks, movie titles, logos, images and other materials remain the property of their respective owners."
    },
    {
      id: "terms-14",
      title: "14. Third-Party Services",
      content: "CineVenue may integrate with third-party services including payment providers, theatres, venues, event organisers, communication providers and technology providers. Third-party services may have their own terms and policies."
    },
    {
      id: "terms-15",
      title: "15. Availability",
      content: "CineVenue aims to maintain reliable services but does not guarantee uninterrupted availability. Services may occasionally be unavailable because of maintenance, technical failures, network problems, security incidents, third-party failures, or force majeure events."
    },
    {
      id: "terms-16",
      title: "16. Limitation of Responsibility",
      content: "CineVenue will take reasonable measures to provide its services. However, CineVenue may not be responsible for matters outside its reasonable control, including changes, cancellations, delays or operational decisions made by independent theatres, venues, event organisers or other third parties. Nothing in these Terms excludes rights or remedies that cannot legally be excluded."
    },
    {
      id: "terms-17",
      title: "17. Changes to These Terms",
      content: "CineVenue may update these Terms from time to time. Updated Terms will be published through CineVenue's website or application. Continued use of CineVenue after an applicable update may constitute acceptance where permitted by law."
    },
    {
      id: "terms-18",
      title: "18. Suspension and Termination",
      content: "CineVenue may suspend or terminate access where reasonably necessary because of fraud, abuse, security concerns, illegal activity, violation of these Terms, or misuse of CineVenue services. Termination does not automatically cancel obligations relating to transactions already completed."
    },
    {
      id: "terms-19",
      title: "19. Governing Law",
      content: "These Terms shall be governed by the applicable laws of India. Subject to applicable law, disputes shall be subject to the jurisdiction of the competent courts having jurisdiction over CineVenue's applicable place of business."
    },
    {
      id: "terms-20",
      title: "20. Contact",
      content: "CineVenue\n\nEmail: info.cinevenue@gmail.com\nPhone: +91 84658 70811\nWebsite: https://cinevenue.com\n\n© 2026 CineVenue. All Rights Reserved."
    }
  ]
};

export const REFUND_POLICY: LegalPolicyDocument = {
  id: "refund",
  title: "CineVenue Refund & Cancellation Policy",
  subtitle: "Rules for Movie & Event Cancellations, Failed Payments, and Dispute Resolutions",
  effectiveDate: "27 August 2026",
  lastUpdated: "27 August 2026",
  badge: "Refund & Dispute Framework",
  summary: "This Refund & Cancellation Policy explains how cancellations, refunds, failed payments and booking-related disputes are handled on CineVenue.",
  contact: {
    name: "CineVenue Refunds & Settlement Desk",
    email: "info.cinevenue@gmail.com",
    phone: "+91 84658 70811",
    website: "https://cinevenue.com",
    address: "Guntur, Andhra Pradesh, India — 522001"
  },
  sections: [
    {
      id: "ref-1",
      title: "1. General Principle",
      content: "Before completing a booking, customers should carefully review movie/event details, theatre/venue, date, showtime, seats, number of tickets, price, applicable fees, and cancellation conditions. Once payment is successfully completed, cancellation eligibility will depend on the applicable booking terms."
    },
    {
      id: "ref-2",
      title: "2. Movie Ticket Cancellation",
      content: "Movie-ticket cancellations may be permitted only where the relevant theatre, booking partner or CineVenue booking terms allow cancellation. Where cancellation is available, the applicable cancellation deadline and refund amount will be displayed or communicated to the customer. Some bookings may be fully refundable, partially refundable, refundable after deduction of applicable charges, or non-refundable."
    },
    {
      id: "ref-3",
      title: "3. Event Cancellation",
      content: "Event cancellation and refund terms may be determined by the event organiser. Where an event is cancelled by the organiser, CineVenue may facilitate the applicable refund process according to the organiser's instructions and applicable law."
    },
    {
      id: "ref-4",
      title: "4. Event Rescheduling",
      content: "If an event is postponed or rescheduled, CineVenue or the event organiser may notify customers about new date, new time, venue changes, ticket validity, and available refund options. Where a refund is offered, the applicable process will be communicated to customers."
    },
    {
      id: "ref-5",
      title: "5. Theatre or Venue Cancellation",
      content: "If a theatre, venue or organiser cancels a booking or service, CineVenue may initiate or facilitate a refund according to the applicable booking arrangement. The refund may be processed back to the original payment method where supported."
    },
    {
      id: "ref-6",
      title: "6. Failed Payment",
      content: "If money is debited from your bank account but the CineVenue booking is not successfully confirmed, CineVenue or the relevant payment provider may reconcile the transaction. If the transaction is confirmed as failed and the amount is received by the payment system, the amount may be refunded according to the payment provider's processing timelines. Customers should not repeatedly make payments for the same booking without checking the booking status."
    },
    {
      id: "ref-7",
      title: "7. Duplicate Payments",
      content: "If you believe you have been charged more than once for the same transaction, contact CineVenue support with Booking ID, Transaction reference, Payment date, Amount, and Relevant payment information. CineVenue may investigate the transaction and coordinate with the payment provider where required."
    },
    {
      id: "ref-8",
      title: "8. Refund Processing",
      content: "Approved refunds are generally processed to the original payment method where technically and legally possible. The time taken for the amount to appear in your account may depend on the payment provider, bank, card issuer, UPI provider, or other financial institution. CineVenue does not control the final processing time of an external financial institution."
    },
    {
      id: "ref-9",
      title: "9. Booking Fees",
      content: "Depending on the applicable booking terms, convenience fees, platform fees or service charges may be refundable, partially refundable, or non-refundable. The applicable treatment will be determined by the terms shown for the booking."
    },
    {
      id: "ref-10",
      title: "10. CineCoin Used in a Booking",
      content: "Where CineCoin has been used toward an eligible booking and that booking is cancelled or refunded, the CineCoin portion may be returned to the customer's CineVenue account according to the applicable CineCoin rules. Any expired or promotional CineCoin may be subject to separate conditions."
    },
    {
      id: "ref-11",
      title: "11. Refund for Fraudulent or Unauthorised Transactions",
      content: "If you believe a transaction was made without your authorisation, contact CineVenue immediately. CineVenue may investigate the transaction and may request information necessary to verify the claim."
    },
    {
      id: "ref-12",
      title: "12. No-Show Bookings",
      content: "If you do not attend a movie or event despite having a valid booking, the booking may be treated as a no-show. No-show bookings may be non-refundable unless the applicable booking terms provide otherwise."
    },
    {
      id: "ref-13",
      title: "13. Incorrect Customer Information",
      content: "Customers are responsible for entering accurate Name, Mobile number, Email address, Booking details, and Payment information. CineVenue may not be responsible for losses caused by incorrect information supplied by the customer."
    },
    {
      id: "ref-14",
      title: "14. Refund Disputes",
      content: "If you believe a refund has not been correctly processed, contact CineVenue support with the relevant booking and transaction information. CineVenue may investigate the matter with the theatre, organiser or payment provider."
    },
    {
      id: "ref-15",
      title: "15. Policy Changes",
      content: "CineVenue may update this Refund & Cancellation Policy from time to time. The version applicable to a booking may depend on the terms presented at the time of purchase, subject to applicable law."
    },
    {
      id: "ref-16",
      title: "16. Contact",
      content: "CineVenue\n\nEmail: info.cinevenue@gmail.com\nPhone: +91 84658 70811\n\nPlease include your Booking ID and transaction reference when contacting support.\n\n© 2026 CineVenue. All Rights Reserved."
    }
  ]
};

export const COOKIE_POLICY: LegalPolicyDocument = {
  id: "cookie",
  title: "CineVenue Cookie Policy",
  subtitle: "Transparency Regarding Local Storage, Cookies, Pixels & Session Tracking",
  effectiveDate: "27 August 2026",
  lastUpdated: "27 August 2026",
  badge: "Cookie & Tracking Framework",
  summary: "This Cookie Policy explains how CineVenue may use cookies and similar technologies on its website and applications.",
  contact: {
    name: "CineVenue Data & Privacy Team",
    email: "info.cinevenue@gmail.com",
    phone: "+91 84658 70811",
    website: "https://cinevenue.com",
    address: "Guntur, Andhra Pradesh, India — 522001"
  },
  sections: [
    {
      id: "ck-1",
      title: "1. What Are Cookies?",
      content: "Cookies are small pieces of information stored on your device when you visit a website. They may help websites remember information, maintain sessions, improve functionality and understand how services are used."
    },
    {
      id: "ck-2",
      title: "2. Why CineVenue Uses Cookies",
      content: "CineVenue may use cookies and similar technologies to keep you signed in, maintain secure sessions, remember preferences, maintain shopping or booking sessions, improve website functionality, improve security, analyse service performance, understand how users interact with the platform, measure promotional campaigns, and provide relevant service features."
    },
    {
      id: "ck-3",
      title: "3. Types of Cookies",
      content: "We use the following classifications of cookies on CineVenue:",
      subsections: [
        {
          title: "A. Strictly Necessary Cookies",
          content: "These cookies are essential for core functionality such as authentication, account sessions, security, booking sessions, and basic website operations. These cookies may not be disabled where doing so would prevent the service from functioning properly."
        },
        {
          title: "B. Preference Cookies",
          content: "These cookies remember user choices such as language, location preferences, display preferences, and other interface configurations."
        },
        {
          title: "C. Analytics Cookies",
          content: "Analytics technologies help CineVenue understand which pages are visited, how users navigate the platform, platform performance, errors and technical problems, and general usage patterns. Analytics information is aggregated and processed according to service standards."
        },
        {
          title: "D. Marketing Technologies",
          content: "Where applicable and permitted, CineVenue may use technologies to measure advertising or promotional campaigns. CineVenue will provide appropriate choices where consent is legally required."
        }
      ]
    },
    {
      id: "ck-4",
      title: "4. Similar Technologies",
      content: "In addition to cookies, CineVenue may use technologies such as local storage, web storage, application SDKs, pixels, device identifiers, and session technologies. These technologies perform functions similar to cookies."
    },
    {
      id: "ck-5",
      title: "5. Third-Party Services",
      content: "Some cookies or similar technologies may be provided by third-party service providers supporting analytics, payment services, security, communication, performance monitoring, or advertising/campaign measurement. Third parties process information according to their own policies."
    },
    {
      id: "ck-6",
      title: "6. Cookie Choices",
      content: "Depending on your browser, device and applicable legal requirements, you may be able to delete cookies, block cookies, restrict cookies, or manage cookie permissions. Disabling certain cookies may affect the functionality of CineVenue."
    },
    {
      id: "ck-7",
      title: "7. Consent",
      content: "Where applicable law requires consent for certain cookies or similar technologies, CineVenue will provide an appropriate consent mechanism. You may be able to change your preferences through available cookie settings."
    },
    {
      id: "ck-8",
      title: "8. Updates",
      content: "CineVenue may update this Cookie Policy when our technology, services or legal requirements change. The latest version will be published through the CineVenue website or application."
    },
    {
      id: "ck-9",
      title: "9. Contact",
      content: "CineVenue\nEmail: info.cinevenue@gmail.com\nPhone: +91 84658 70811\nWebsite: https://cinevenue.com\n\n© 2026 CineVenue. All Rights Reserved."
    }
  ]
};

export const USER_AGREEMENT: LegalPolicyDocument = {
  id: "user-agreement",
  title: "CineVenue User Agreement",
  subtitle: "Account Ownership, CineCoin Regulations, Acceptable Use & Mutual Commitments",
  effectiveDate: "27 August 2026",
  lastUpdated: "27 August 2026",
  badge: "User Account & Platform Charter",
  summary: "This User Agreement establishes the rules governing your use of your CineVenue account and the CineVenue platform.",
  contact: {
    name: "CineVenue User Relations",
    email: "info.cinevenue@gmail.com",
    phone: "+91 84658 70811",
    website: "https://cinevenue.com",
    address: "Guntur, Andhra Pradesh, India — 522001"
  },
  sections: [
    {
      id: "ua-1",
      title: "1. Account Creation",
      content: "You may create a CineVenue account using supported registration or authentication methods. You agree to provide information that is accurate and current. You must not create an account using another person's identity or information without appropriate authorisation."
    },
    {
      id: "ua-2",
      title: "2. Account Security",
      content: "You are responsible for protecting your account credentials. You should use a secure password, keep authentication codes confidential, log out of shared devices, and notify CineVenue immediately of suspected unauthorised access. CineVenue representatives will not normally request your password, OTP, PIN or CVV."
    },
    {
      id: "ua-3",
      title: "3. Acceptable Use",
      content: "You agree to use CineVenue only for lawful purposes. You must not use the platform to commit fraud, misuse booking systems, manipulate CineCoin rewards, abuse promotional offers, create deceptive accounts, sell or misuse tickets where prohibited, interfere with platform security, attempt unauthorised access, upload malicious content, or circumvent platform restrictions."
    },
    {
      id: "ua-4",
      title: "4. Booking Responsibility",
      content: "You are responsible for checking your booking before payment. After receiving a booking confirmation, verify Movie or event, Date, Time, Venue, Seats, Ticket/pass quantity, and Customer details."
    },
    {
      id: "ua-5",
      title: "5. Digital Tickets",
      content: "Digital tickets and QR codes are issued for the relevant booking. You must not alter a ticket, duplicate a ticket for unauthorised use, attempt to bypass QR validation, or present fraudulent booking information. The first valid use of a ticket may invalidate subsequent attempts to use the same ticket."
    },
    {
      id: "ua-6",
      title: "6. CineCoin Account",
      content: "CineCoin rewards are associated with the eligible CineVenue account. CineCoin balances and transactions may be adjusted where necessary to correct technical errors, duplicate rewards, fraudulent rewards, reversed bookings, or unauthorised activity. CineCoin earning and redemption are subject to CineVenue's current reward rules."
    },
    {
      id: "ua-7",
      title: "7. Reviews and User Content",
      content: "Where CineVenue permits reviews, comments or other user-generated content, you agree not to submit content that is illegal, threatening, abusive, defamatory, misleading, fraudulent, infringing of third-party rights, or harmful to other users. CineVenue may remove content that violates applicable rules or law."
    },
    {
      id: "ua-8",
      title: "8. Communications",
      content: "By maintaining an account, you may receive essential service communications relating to account security, bookings, payments, refunds, tickets, events, CineCoin, and important service changes. Promotional communications may be subject to applicable consent and communication preferences."
    },
    {
      id: "ua-9",
      title: "9. Account Suspension",
      content: "CineVenue may temporarily restrict or suspend an account where reasonably necessary to protect users, investigate suspected fraud, prevent abuse, protect platform security, comply with legal obligations, or enforce applicable terms. Where appropriate, CineVenue may provide information regarding the reason for a restriction."
    },
    {
      id: "ua-10",
      title: "10. Account Closure",
      content: "You may request closure of your CineVenue account through the available account or support mechanisms. Certain information may need to be retained for legitimate purposes such as legal compliance, financial records, fraud prevention, dispute resolution, and transaction records."
    },
    {
      id: "ua-11",
      title: "11. Privacy",
      content: "Personal information associated with your account is handled according to the CineVenue Privacy Statement."
    },
    {
      id: "ua-12",
      title: "12. Third-Party Accounts",
      content: "If you use a third-party authentication service to access CineVenue, additional terms and privacy policies of that third party may apply."
    },
    {
      id: "ua-13",
      title: "13. Changes to the User Agreement",
      content: "CineVenue may update this User Agreement from time to time. The latest version will be made available through the CineVenue platform."
    },
    {
      id: "ua-14",
      title: "14. Relationship With Other Policies",
      content: "This User Agreement should be read together with:\n\n1. CineVenue Privacy Statement\n2. CineVenue Terms & Conditions\n3. CineVenue Refund & Cancellation Policy\n4. CineVenue Cookie Policy\n5. Applicable CineCoin Terms\n6. Any event-specific or booking-specific terms\n\nIf a service-specific term conflicts with a general term, the specific term may apply to that particular service to the extent permitted by law."
    },
    {
      id: "ua-15",
      title: "15. Contact",
      content: "CineVenue\n\nEmail: info.cinevenue@gmail.com\nPhone: +91 84658 70811\nWebsite: https://cinevenue.com\n\n© 2026 CineVenue. All Rights Reserved."
    }
  ]
};

export const ALL_LEGAL_POLICIES: Record<string, LegalPolicyDocument> = {
  privacy: PRIVACY_STATEMENT,
  terms: TERMS_AND_CONDITIONS,
  refund: REFUND_POLICY,
  cookie: COOKIE_POLICY,
  "user-agreement": USER_AGREEMENT
};

import React from "react";

export default function PrivacyPolicy() {
    return (
        <main className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 font-heading">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                    <p>
                        Welcome to my portfolio website. I respect your privacy and am committed to protecting your personal data.
                        This privacy policy will inform you as to how I look after your personal data when you visit my website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">2. Data I Collect</h2>
                    <p>
                        I may collect, use, store and transfer different kinds of personal data about you which I have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address and telephone number.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                        <li><strong>Usage Data</strong> includes information about how you use my website and services.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">3. How I Use Your Data</h2>
                    <p>
                        I will only use your personal data when the law allows me to. Most commonly, I will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Where I need to perform the contract I am about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for my legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where I need to comply with a legal or regulatory obligation.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                    <p>
                        I have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, I limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">5. Google AdSense & Advertising Cookies</h2>
                    <p>
                        This website uses Google AdSense, a third-party advertising service provided by Google LLC. 
                        Google AdSense uses cookies to serve interest-based advertisements to users based on their visits to this website 
                        and other sites across the Internet.
                    </p>
                    <p className="mt-2">
                        Google's use of advertising cookies enables it and its partners to serve targeted ads based on your web browsing history. 
                        You can opt out of personalized advertising at any time by visiting the 
                        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mx-1">
                            Google Ads Settings
                        </a> 
                        page. Alternatively, you can opt out of third-party vendors' cookies for personalized advertising by visiting 
                        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                            www.aboutads.info
                        </a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Details</h2>
                    <p>
                        If you have any questions about this privacy policy or my privacy practices, please contact me via the contact form on this website.
                    </p>
                </section>
            </div>
        </main>
    );
}

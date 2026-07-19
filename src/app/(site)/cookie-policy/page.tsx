import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy | RelayWorks",
    description: "Read our cookie policy to understand how we use cookies and tracking technologies to improve your experience.",
    alternates: {
        canonical: '/cookie-policy',
    }
};

export default function CookiePolicy() {
    return (
        <main className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 font-heading">Cookie Policy</h1>
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies</h2>
                    <p>
                        Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Cookies</h2>
                    <p>
                        We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">3. The Cookies We Set</h2>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                            <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this information can be called whenever you interact with a page is affected by your preferences.
                        </li>
                        <li>
                            <strong>Third Party Cookies:</strong> In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience.</li>
                                <li>
                                    This site uses <strong>Google AdSense</strong> to serve advertisements. Google uses cookies (including the DoubleClick DART cookie) to serve relevant, interest-based ads to our visitors based on their browsing activity. You can learn more or opt out of these personalized advertising cookies by visiting 
                                    <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                        Google Ads Settings
                                    </a>.
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">4. Disabling Cookies</h2>
                    <p>
                        You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site. Therefore it is recommended that you do not disable cookies.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">5. More Information</h2>
                    <p>
                        Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                    </p>
                </section>
            </div>
        </main>
    );
}

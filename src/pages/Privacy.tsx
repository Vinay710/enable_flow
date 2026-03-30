import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";

const Privacy = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  useEffect(() => {
    document.title = "Privacy Policy | EnableFlow";
    const head = document.head;
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/privacy`;
    setMetaDescription("EnableFlow respects your privacy. We do not require logins and do not store personal data. Learn how we handle information, cookies, and security.");
    setMetaKeywords("privacy policy, data protection, cookies, security, no login, EnableFlow");
    setCanonicalUrl(canonicalHref);
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": canonicalHref }
      ]
    };
    const webPageJson = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy | EnableFlow",
      "description": "EnableFlow privacy policy for free productivity tools.",
      "url": canonicalHref
    };
    const addJsonLd = (json: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.setAttribute("type", "application/ld+json");
      s.textContent = JSON.stringify(json);
      head.appendChild(s);
      return s;
    };
    const s1 = addJsonLd(breadcrumbJson);
    const s2 = addJsonLd(webPageJson);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-foreground">Home</Link>
                </li>
                <li>/</li>
                <li className="text-foreground">Privacy Policy</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
              EnableFlow offers free tools that run in your browser. We do not ask for logins and we do not store personal information on our servers.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
                <p className="text-muted-foreground mt-2">
                  We do not collect personally identifiable information. Tool inputs are processed locally in your browser and are not transmitted to a backend service, except for standard, anonymous analytics that help improve site performance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Cookies</h2>
                <p className="text-muted-foreground mt-2">
                  We may use strictly necessary cookies for functionality. We avoid tracking cookies. Any optional analytics are anonymized and focus on aggregate usage to improve user experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
                <p className="text-muted-foreground mt-2">
                  Where third-party libraries or CDNs are used, they are chosen for performance and reliability. We do not share personal data with third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
                <p className="text-muted-foreground mt-2">
                  Our tools are designed to keep computation on-device whenever possible. Always avoid entering sensitive information; if you do, it remains in your session and is not stored by us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Changes</h2>
                <p className="text-muted-foreground mt-2">
                  We may update this policy to reflect improvements or regulatory changes. Updates are effective upon posting.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
                <p className="text-muted-foreground mt-2">
                  For privacy questions, contact us via the About page or social links in the footer.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

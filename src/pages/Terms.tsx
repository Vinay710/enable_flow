import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";

const Terms = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  useEffect(() => {
    document.title = "Terms & Conditions | EnableFlow";
    const head = document.head;
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/terms`;
    setMetaDescription("Read EnableFlow’s terms of use. Understand acceptable use, disclaimers, limitations, and changes.");
    setMetaKeywords("terms, terms of use, acceptable use, disclaimer, limitation of liability, EnableFlow");
    setCanonicalUrl(canonicalHref);
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Terms & Conditions", "item": canonicalHref }
      ]
    };
    const webPageJson = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms & Conditions | EnableFlow",
      "description": "EnableFlow terms of use.",
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
                <li className="text-foreground">Terms & Conditions</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Terms & Conditions
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
              These terms govern your use of EnableFlow’s free tools. By using the site, you agree to these terms.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground">Acceptable Use</h2>
                <p className="text-muted-foreground mt-2">
                  Use the tools responsibly and for lawful purposes. Do not attempt to disrupt services or misuse the tools.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">No Warranty</h2>
                <p className="text-muted-foreground mt-2">
                  Tools are provided “as is”. We strive for accuracy but do not guarantee outcomes. Validate results before relying on them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
                <p className="text-muted-foreground mt-2">
                  We are not liable for direct or indirect losses arising from use of the tools. You are responsible for decisions made using results.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Changes</h2>
                <p className="text-muted-foreground mt-2">
                  We may update these terms over time. Continued use after changes indicates acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
                <p className="text-muted-foreground mt-2">
                  For questions about these terms, reach out via the About page or footer social links.
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

export default Terms;

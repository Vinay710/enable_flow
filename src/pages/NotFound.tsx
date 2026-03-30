import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";

const NotFound = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "404 - Page Not Found | EnableFlow";
    setMetaDescription("The page you are looking for does not exist.");
    setMetaKeywords("404, page not found, EnableFlow");
    setCanonicalUrl(window.location.href);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

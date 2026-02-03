import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "place";
  ogImage?: string;
  structuredData?: object;
  // Location-specific props for local business schema
  businessName?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip?: string;
    country?: string;
  };
  phone?: string;
  website?: string;
  category?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = "https://files.manuscdn.com/user_upload_by_module/session_file/99778916/TzwKbZtYhBOMfoAs.png",
  structuredData,
  businessName,
  address,
  phone,
  website,
  category,
  coordinates,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("robots", "index, follow");

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:site_name", "National Recycling Directory", true);
    if (canonicalUrl) {
      setMetaTag("og:url", canonicalUrl, true);
    }

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalElement) {
        canonicalElement = document.createElement("link");
        canonicalElement.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute("href", canonicalUrl);
    } else if (canonicalElement) {
      canonicalElement.remove();
    }

    // Structured Data (JSON-LD)
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    if (existingScript) {
      existingScript.remove();
    }

    // Build structured data for local business if applicable
    let jsonLd = structuredData;
    if (!jsonLd && businessName && address) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "RecyclingCenter",
        name: businessName,
        description: description,
        address: {
          "@type": "PostalAddress",
          streetAddress: address.street,
          addressLocality: address.city,
          addressRegion: address.state,
          postalCode: address.zip || "",
          addressCountry: address.country || "US",
        },
        ...(phone && { telephone: phone }),
        ...(website && { url: website }),
        ...(category && { additionalType: category }),
        ...(coordinates && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
        }),
      };
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Reset title on unmount (optional - comment out if you want title to persist)
      // document.title = "National Recycling Directory";
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogType,
    ogImage,
    structuredData,
    businessName,
    address,
    phone,
    website,
    category,
    coordinates,
  ]);

  return null; // This component doesn't render anything visible
}

// Helper function to generate facility SEO data
export function generateFacilitySEO(facility: {
  name: string;
  category: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  materials?: string[];
}) {
  const cityState = facility.city && facility.state 
    ? `${facility.city}, ${facility.state}` 
    : "";
  
  const materialsText = facility.materials?.length 
    ? ` Accepts: ${facility.materials.slice(0, 3).join(", ")}${facility.materials.length > 3 ? ", and more" : ""}.`
    : "";

  return {
    title: `${facility.name} - ${facility.category} | National Recycling Directory`,
    description: `Find recycling services at ${facility.name}${cityState ? ` in ${cityState}` : ""}. ${facility.category} facility.${materialsText} Get directions, hours, and contact information.`,
    businessName: facility.name,
    category: facility.category,
    phone: facility.phone,
    website: facility.website,
    coordinates: facility.latitude && facility.longitude 
      ? { lat: facility.latitude, lng: facility.longitude }
      : undefined,
  };
}

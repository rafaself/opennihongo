import { Link } from "@tanstack/react-router";
import {
  componentCatalogCategories,
  componentCatalogResources,
} from "../../catalog/components";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./ComponentsIndexPage.css";

function ComponentCategoryCards() {
  return (
    <div className="gallery-components-index-category-grid">
      {componentCatalogCategories.map((category) => (
        <article className="gallery-components-index-card" key={category.id}>
          <header>
            <h3>
              <Link to={category.to}>{category.label}</Link>
            </h3>
            <p>{category.description}</p>
          </header>
          <ul aria-label={`${category.label} APIs`}>
            {category.items.map((item) => (
              <li key={item}>
                <Link to={category.to}>{item}</Link>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function RelatedCatalogCards() {
  return (
    <section
      aria-labelledby="components-index-related-title"
      className="gallery-components-index-related"
    >
      <header>
        <h3 id="components-index-related-title">
          Foundations and related catalogs
        </h3>
        <p>
          Shared primitives, gamification components, patterns, and assets are
          documented in their owning Gallery sections.
        </p>
      </header>
      <div className="gallery-components-index-resource-grid">
        {componentCatalogResources.map((resource) => (
          <article className="gallery-components-index-card" key={resource.id}>
            <h4>{resource.label}</h4>
            <p>{resource.description}</p>
            <ul aria-label={`${resource.label} APIs`}>
              {resource.items.map(({ name, to }) => (
                <li key={name}>
                  <Link to={to}>{name}</Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComponentsCatalog() {
  return (
    <div className="gallery-components-index">
      <ComponentCategoryCards />
      <RelatedCatalogCards />
    </div>
  );
}

export function ComponentsIndexPage() {
  return (
    <GalleryDocumentationPage
      examples={<ComponentsCatalog />}
      examplesTitle="Browse the catalog"
      eyebrow="Components / Catalog"
      id="components-index"
      notes={[
        {
          title: "Public APIs only",
          content: (
            <p>
              This index lists implemented runtime exports from
              <code> @opennihongo/ui</code> and
              <code> @opennihongo/ui/icons</code>. Each link opens the page that
              documents its API; examples and behavior remain owned by those
              pages and the shared package.
            </p>
          ),
        },
      ]}
      summary="Find the implemented shared UI APIs by purpose and open their focused Gallery documentation. The catalog links to public component examples and canonical foundation or asset pages."
      title="Components"
    />
  );
}

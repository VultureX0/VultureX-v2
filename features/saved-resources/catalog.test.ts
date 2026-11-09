import assert from "node:assert/strict";
import test from "node:test";
import {
  getSavedResourceCatalogEntry,
  listSavedResourceCatalog,
} from "./catalog";

test("catalogue contains section, topic and featured keys", () => {
  const section = getSavedResourceCatalogEntry("/knowledge-hub/start-business");
  assert.ok(section);
  assert.equal(section.category, "Knowledge Hub");

  const topic = getSavedResourceCatalogEntry(
    "/knowledge-hub/start-business#idea-validation"
  );
  assert.ok(topic);

  const featured = getSavedResourceCatalogEntry(
    "/knowledge-hub/funding#investor-readiness"
  );
  assert.ok(featured);

  assert.equal(getSavedResourceCatalogEntry("/knowledge-hub/for-you"), null);
  assert.equal(getSavedResourceCatalogEntry("/not-a-real-resource"), null);
});

test("catalogue keys are unique", () => {
  const catalog = listSavedResourceCatalog();
  assert.ok(catalog.length > 20);
  assert.equal(new Set(catalog.map((entry) => entry.key)).size, catalog.length);
  for (const entry of catalog) {
    assert.ok(entry.title.length > 0 && entry.href.startsWith("/knowledge-hub"));
  }
});

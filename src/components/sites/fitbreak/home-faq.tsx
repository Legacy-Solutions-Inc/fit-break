import { FaqSection } from "./faq-section";
import { DEFINITION_SENTENCE, HOME_FAQS } from "./home-faq-content";

/**
 * Homepage definition sentence + FAQ. Rendered only while `homepageFaqEnabled`
 * (src/config.ts) is on; the page emits the matching FAQPage structured data.
 */
export function HomeFaq() {
  return (
    <FaqSection faqs={HOME_FAQS} intro={DEFINITION_SENTENCE} className="border-t border-rule" />
  );
}

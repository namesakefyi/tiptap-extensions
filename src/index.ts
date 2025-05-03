import { Extension } from "@tiptap/core";
import { Disclosure } from "./disclosures/disclosure";
import { DisclosureContent } from "./disclosures/disclosure-content";
import { DisclosureTitle } from "./disclosures/disclosure-title";
import { Disclosures } from "./disclosures/disclosures";
import { StepContent } from "./steps/step-content";
import { StepItem } from "./steps/step-item";
import { StepTitle } from "./steps/step-title";
import { Steps } from "./steps/steps";

export const DisclosuresKit = Extension.create({
  name: "disclosuresKit",

  addExtensions() {
    const extensions = [
      Disclosures,
      Disclosure,
      DisclosureTitle,
      DisclosureContent,
    ];
    return extensions;
  },
});

export const StepsKit = Extension.create({
  name: "stepsKit",

  addExtensions() {
    const extensions = [Steps, StepItem, StepTitle, StepContent];
    return extensions;
  },
});

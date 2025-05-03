import { Disclosures } from "./disclosures/disclosures";
import { Disclosure } from "./disclosures/disclosure";
import { DisclosureTitle } from "./disclosures/disclosure-title";
import { DisclosureContent } from "./disclosures/disclosure-content";
import { Steps } from "./steps/steps";
import { StepItem } from "./steps/step-item";
import { StepTitle } from "./steps/step-title";
import { StepContent } from "./steps/step-content";
import { Extension } from "@tiptap/core";

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

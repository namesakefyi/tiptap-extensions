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
    return [Disclosures, Disclosure, DisclosureTitle, DisclosureContent];
  },
});

export const StepsKit = Extension.create({
  name: "stepsKit",

  addExtensions() {
    return [Steps, StepItem, StepTitle, StepContent];
  },
});

export * from "./disclosures/disclosure";
export * from "./disclosures/disclosure-content";
export * from "./disclosures/disclosure-title";
export * from "./disclosures/disclosures";
export * from "./steps/step-content";
export * from "./steps/step-item";
export * from "./steps/step-title";
export * from "./steps/steps";

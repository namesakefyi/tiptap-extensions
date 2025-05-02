import { findParentNode } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import { canJoin } from "@tiptap/pm/transform";

// https://github.com/ueberdosis/tiptap/blob/develop/packages/core/src/commands/toggleList.ts
export const joinListBackwards = (
  tr: Transaction,
  nodeType: string,
): boolean => {
  const disclosures = findParentNode((node) => node.type.name === nodeType)(
    tr.selection,
  );
  if (!disclosures) return true;

  const before = tr.doc
    .resolve(Math.max(0, disclosures.pos - 1))
    .before(disclosures.depth);
  if (before === undefined) return true;

  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards =
    disclosures.node.type === nodeBefore?.type &&
    canJoin(tr.doc, disclosures.pos);
  if (!canJoinBackwards) return true;

  tr.join(disclosures.pos);
  return true;
};

export const joinListForwards = (
  tr: Transaction,
  nodeType: string,
): boolean => {
  const disclosures = findParentNode((node) => node.type.name === nodeType)(
    tr.selection,
  );
  if (!disclosures) return true;

  const after = tr.doc.resolve(disclosures.start).after(disclosures.depth);
  if (after === undefined) return true;

  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards =
    disclosures.node.type === nodeAfter?.type && canJoin(tr.doc, after);
  if (!canJoinForwards) return true;

  tr.join(after);
  return true;
};

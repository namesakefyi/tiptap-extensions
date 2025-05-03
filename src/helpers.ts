import { findParentNode } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import { canJoin } from "@tiptap/pm/transform";

// https://github.com/ueberdosis/tiptap/blob/develop/packages/core/src/commands/toggleList.ts
export const joinListBackwards = (
  tr: Transaction,
  nodeType: string,
): boolean => {
  const parent = findParentNode((node) => node.type.name === nodeType)(
    tr.selection,
  );
  if (!parent) return true;

  const before = tr.doc
    .resolve(Math.max(0, parent.pos - 1))
    .before(parent.depth);
  if (before === undefined) return true;

  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards =
    parent.node.type === nodeBefore?.type && canJoin(tr.doc, parent.pos);
  if (!canJoinBackwards) return true;

  tr.join(parent.pos);
  return true;
};

export const joinListForwards = (
  tr: Transaction,
  nodeType: string,
): boolean => {
  const parent = findParentNode((node) => node.type.name === nodeType)(
    tr.selection,
  );
  if (!parent) return true;

  const after = tr.doc.resolve(parent.start).after(parent.depth);
  if (after === undefined) return true;

  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards =
    parent.node.type === nodeAfter?.type && canJoin(tr.doc, after);
  if (!canJoinForwards) return true;

  tr.join(after);
  return true;
};

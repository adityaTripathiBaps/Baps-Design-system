import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export interface BapsToolbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Page/section title rendered in the start (left) slot, after any left content. */
  title?: ReactNode;
  /** Content to render in the left slot, before the title. */
  left?: ReactNode;
  /** Content to render in the right slot. */
  right?: ReactNode;
  /** Ref to the wrapper container */
  ref?: Ref<HTMLElement>;
}

/**
 * baps-toolbar — Sampark page-level toolbar: title on the left,
 * search/actions on the right.
 *
 * Sampark-only, per the source contract — there is no MyBKY equivalent of this pattern,
 * so this component takes no brand input and carries no .baps-sampark scoping.
 */
export function BapsToolbar({
  title,
  left,
  right,
  className,
  ref,
  ...nativeProps
}: BapsToolbarProps): ReactElement {
  const content = (
    <div className="p-toolbar p-component">
      <div className="p-toolbar-group-start p-toolbar-group-left p-toolbar-start">
        {left}
        {title && <h1 className="page-toolbar-title">{title}</h1>}
      </div>
      <div className="p-toolbar-group-end p-toolbar-group-right p-toolbar-end">
        {right}
      </div>
    </div>
  );

  return createElement(
    'baps-toolbar',
    { ref, className, ...nativeProps },
    content
  );
}

BapsToolbar.displayName = 'BapsToolbar';

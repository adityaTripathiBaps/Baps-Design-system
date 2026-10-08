'use client';

import {
  createElement,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsButton } from '../button/button.js';
import { BapsIcon } from '../icon/icon.js';

export type BapsFileUploadBrand = 'mybky' | 'sampark';
export type BapsFileUploadEvent =
  ChangeEvent<HTMLInputElement> | DragEvent<HTMLElement>;

type NativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange'>;

export type BapsFileUploadProps = NativeProps & {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  buttonLabel?: ReactNode;
  hint?: ReactNode;
  description?: ReactNode;
  ariaLabel?: string;
  brand?: BapsFileUploadBrand;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'accept' | 'disabled' | 'multiple' | 'onChange' | 'type'
  >;
  onFilesSelected?: (
    files: readonly File[],
    event: BapsFileUploadEvent,
  ) => void;
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLElement>;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/** Native click/drag file picker using the canonical shared dropzone skin. */
export function BapsFileUpload({
  accept,
  multiple = false,
  disabled = false,
  invalid = false,
  buttonLabel = 'Upload Image',
  hint = 'Click to upload or drag and drop',
  description = 'SVG, PNG, JPG or GIF (max. 800×400px)',
  ariaLabel,
  brand = 'mybky',
  inputProps,
  onFilesSelected,
  inputRef,
  className,
  ref,
  ...nativeProps
}: BapsFileUploadProps): ReactElement {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const open = () => {
    if (!disabled) internalInputRef.current?.click();
  };

  const emitFiles = (
    files: FileList | readonly File[],
    event: BapsFileUploadEvent,
  ) => {
    const selected = Array.from(files);
    if (selected.length === 0) return;
    onFilesSelected?.(multiple ? selected : selected.slice(0, 1), event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  };

  const zone = (
    <div
      className={joinClassNames(
        'baps-file-upload-zone',
        dragOver && 'baps-file-upload-dragover',
        invalid && 'baps-file-upload-invalid',
        disabled && 'baps-file-upload-disabled',
      )}
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-label={
        ariaLabel ?? (typeof hint === 'string' ? hint : 'Upload files')
      }
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      onClick={open}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragOver(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (!disabled) emitFiles(event.dataTransfer.files, event);
      }}
    >
      <input
        {...inputProps}
        ref={(node) => {
          internalInputRef.current = node;
          assignRef(inputRef, node);
        }}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          emitFiles(event.currentTarget.files ?? [], event);
          event.currentTarget.value = '';
        }}
      />
      <div className="baps-file-upload-ring" aria-hidden="true">
        <div className="baps-file-upload-icon">
          <BapsIcon name="image" size="inherit" />
        </div>
      </div>
      {brand === 'sampark' ? (
        <BapsButton
          inert
          tabIndex={-1}
          label={buttonLabel}
          severity="secondary"
          size="small"
          brand="sampark"
          disabled={disabled}
        />
      ) : (
        <BapsButton
          inert
          tabIndex={-1}
          label={buttonLabel}
          severity="secondary"
          size="small"
          brand="mybky"
          disabled={disabled}
        />
      )}
      {hint !== undefined && hint !== null && (
        <p className="baps-file-upload-hint">{hint}</p>
      )}
      {description !== undefined && description !== null && (
        <p className="baps-file-upload-hint">{description}</p>
      )}
    </div>
  );

  return createElement(
    'baps-file-upload',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        className,
      ),
    },
    zone,
  );
}

BapsFileUpload.displayName = 'BapsFileUpload';

import { createRef, type MouseEvent } from 'react';
import {
  BapsAlert,
  BapsAvatar,
  BapsAvatarGroup,
  BapsBadge,
  BapsButton,
  BapsCard,
  BapsCheckbox,
  BapsDivider,
  BapsFloatLabel,
  BapsIcon,
  BapsIconField,
  BapsIndicator,
  BapsInputIcon,
  BapsInputGroup,
  BapsInputText,
  BapsLink,
  BapsMessage,
  BapsOverlayBadge,
  BapsProgressBar,
  BapsRadio,
  BapsSegmented,
  BapsSkeleton,
  BapsSpinner,
  BapsTag,
  BapsTextarea,
  BapsToggleSwitch,
  type BapsButtonProps,
} from '@org/ui-kit-react';

const buttonRef = createRef<HTMLButtonElement>();
const iconRef = createRef<HTMLElement>();
const switchRef = createRef<HTMLInputElement>();

const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget.focus();
};

export const strictReactConsumer = (
  <section>
    <BapsIcon ref={iconRef} name="notification" size="md" />
    <BapsButton
      ref={buttonRef}
      label="Save"
      icon="check"
      onClick={handleClick}
    />
    <BapsButton
      brand="sampark"
      severity="secondary"
      variant="ghost"
      loading
      aria-describedby="save-status"
    >
      Saving
    </BapsButton>
    <BapsButton icon="trash" aria-label="Delete" />
    <BapsLink href="/details" onClick={(event) => event.currentTarget.focus()}>
      Details
    </BapsLink>
    <BapsAvatarGroup size="l" aria-label="Committee members">
      <BapsAvatar label="GP" size="l" />
      <BapsAvatar image="/members/ap.jpg" imageAlt="Anand Patel" size="l" />
      <BapsAvatar brand="sampark" size="l" aria-label="Profile">
        <BapsIcon name="user" />
      </BapsAvatar>
    </BapsAvatarGroup>
    <BapsBadge value={8} severity="danger" />
    <BapsBadge severity="success" aria-label="Online" />
    <BapsOverlayBadge value={4} badgeAriaLabel="4 unread notifications">
      <BapsButton icon="notification" aria-label="Notifications" />
    </BapsOverlayBadge>
    <BapsIndicator severity="success" />
    <BapsIndicator severity="error" text aria-label="3 unread notifications">
      3
    </BapsIndicator>
    <BapsTag value="Registered" severity="success" icon="check" />
    <BapsTag
      value="Member"
      brand="sampark"
      action
      actionLabel="Open member"
      onAction={(event) => event.currentTarget.focus()}
    />
    <BapsAlert
      severity="warning"
      title="Session expiring"
      closable
      closeLabel="Dismiss warning"
      onClose={(event) => event.currentTarget.focus()}
    >
      Save your changes.
    </BapsAlert>
    <BapsAlert
      appearance="card"
      severity="success"
      title="Upload complete"
      text="All records were saved."
      progress={100}
      progressLabel="Complete"
      primaryAction="View"
      onPrimaryAction={(event) => event.currentTarget.focus()}
    />
    <BapsCard
      title="Registrations"
      subtitle="This week"
      actions={<BapsButton label="Export" />}
      footer="Updated today"
      divided
    >
      24 registrations
    </BapsCard>
    <BapsCard
      interactive
      onClick={(event) => event.currentTarget.focus()}
      aria-label="Open member"
    >
      Member details
    </BapsCard>
    <BapsDivider />
    <BapsDivider layout="vertical" type="dashed" align="bottom" size="compact">
      OR
    </BapsDivider>
    <BapsProgressBar value={72} showValue aria-label="Upload progress" />
    <BapsProgressBar
      mode="indeterminate"
      severity="info"
      brand="sampark"
      aria-label="Loading members"
    />
    <BapsSpinner value={45} size="small" aria-label="Upload progress" />
    <BapsSpinner brand="sampark" ariaLabel="Loading members" />
    <div aria-busy="true" aria-label="Loading member details">
      <BapsSkeleton shape="circle" size="3rem" />
      <BapsSkeleton width="80%" height="1rem" brand="sampark" />
    </div>
    <BapsFloatLabel>
      <BapsInputText id="member-email" type="email" name="email" />
      <label htmlFor="member-email">Email</label>
    </BapsFloatLabel>
    <BapsIconField iconPosition="left" brand="sampark">
      <BapsInputIcon icon="search-2" />
      <BapsInputText aria-label="Search members" pSize="small" />
    </BapsIconField>
    <BapsTextarea
      name="notes"
      autoResize
      invalid
      aria-describedby="notes-error"
    />
    <BapsMessage id="notes-error" severity="error" variant="simple">
      Notes are required.
    </BapsMessage>
    <BapsCheckbox
      id="active-member"
      label="Active member"
      checked
      onChange={(event) => event.currentTarget.focus()}
    />
    <BapsRadio
      id="scope-all"
      name="scope"
      value="all"
      label="All members"
      defaultChecked
    />
    <BapsRadio
      id="scope-mine"
      name="scope"
      value="mine"
      label="My members"
      brand="sampark"
    />
    <BapsCheckbox
      aria-label="Select all members"
      indeterminate
      brand="sampark"
      checkboxSize="large"
    />
    <BapsToggleSwitch
      ref={switchRef}
      id="email-notifications"
      label="Email notifications"
      name="emailNotifications"
      toggleSize="lg"
      brand="sampark"
      checked
      onChange={(event) => event.currentTarget.focus()}
    />
    <BapsToggleSwitch aria-label="SMS notifications" readOnly />
    <BapsInputGroup
      prefix="min"
      suffix="day/s"
      brand="sampark"
      aria-label="Minimum duration group"
    >
      <BapsInputText
        type="number"
        name="minimumDays"
        aria-label="Minimum days"
      />
    </BapsInputGroup>
    <BapsSegmented
      ariaLabel="Frequency"
      options={[
        { label: 'Once', value: 'once' },
        { label: 'Repeat', value: 'repeat' },
        { label: 'Ad-hoc', value: 'adhoc', disabled: true },
      ]}
      value="once"
      onValueChange={(value, event) => {
        value?.toUpperCase();
        event.currentTarget.focus();
      }}
    />
    <BapsSegmented
      multiple
      ariaLabel="Repeat on"
      options={['Su', 'Mo', 'Tu', 'We']}
      defaultValue={['Su', 'We']}
      onValueChange={(value) => value.map((day) => day.toUpperCase())}
    />
  </section>
);

export const buttonProps = {
  label: 'Create',
  type: 'submit',
  onFocus: (event) => event.currentTarget.focus(),
} satisfies BapsButtonProps;

// @ts-expect-error icon-only buttons require an accessible name
export const inaccessibleIconButton = <BapsButton icon="trash" />;

// @ts-expect-error refs are typed to the native button element
export const wrongRef = <BapsButton ref={iconRef} label="Wrong ref" />;

// @ts-expect-error image avatars require native-equivalent alt text
export const imageWithoutAlt = <BapsAvatar image="/member.jpg" />;

export const inaccessibleIconAvatar = (
  // @ts-expect-error icon avatars must be labelled or explicitly decorative
  <BapsAvatar>
    <BapsIcon name="user" />
  </BapsAvatar>
);

// @ts-expect-error dot badges must be labelled or explicitly decorative
export const inaccessibleDotBadge = <BapsBadge severity="success" />;

// @ts-expect-error trailing tag actions require an accessible name
export const inaccessibleTagAction = <BapsTag value="Filter" action />;

// @ts-expect-error interactive cards require a click behavior
export const inertInteractiveCard = <BapsCard interactive>Member</BapsCard>;

// @ts-expect-error labelled checkboxes require an id for native association
export const checkboxLabelWithoutId = <BapsCheckbox label="Active" />;

// @ts-expect-error labelled radios require an id for native association
export const radioLabelWithoutId = <BapsRadio label="All" />;

// @ts-expect-error labelled switches require an id for native association
export const toggleLabelWithoutId = <BapsToggleSwitch label="Email" />;

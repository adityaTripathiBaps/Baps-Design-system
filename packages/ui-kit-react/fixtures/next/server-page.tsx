import {
  BapsAlert,
  BapsAvatar,
  BapsAvatarGroup,
  BapsBadge,
  BapsCard,
  BapsCheckbox,
  BapsDivider,
  BapsIconField,
  BapsIcon,
  BapsInputIcon,
  BapsInputGroup,
  BapsInputText,
  BapsIndicator,
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
} from '@org/ui-kit-react';

export default function ServerPage() {
  return (
    <>
      <BapsIcon name="notification" label="Notifications" />
      <BapsLink href="/details">Details</BapsLink>
      <BapsAvatarGroup aria-label="Members">
        <BapsAvatar label="GP" />
        <BapsAvatar image="/member.jpg" imageAlt="Anand Patel" />
      </BapsAvatarGroup>
      <BapsBadge value={8} severity="danger" />
      <BapsOverlayBadge value={4} badgeAriaLabel="4 updates">
        <span>Updates</span>
      </BapsOverlayBadge>
      <BapsIndicator severity="info" aria-label="Information available" />
      <BapsTag value="Registered" severity="success" />
      <BapsAlert severity="success">Import complete.</BapsAlert>
      <BapsAlert
        appearance="card"
        title="New notification"
        text="A new seva request is available."
      />
      <BapsCard title="Registrations" footer="Updated today">
        24 registrations
      </BapsCard>
      <BapsDivider brand="sampark">OR</BapsDivider>
      <BapsProgressBar
        mode="indeterminate"
        brand="sampark"
        aria-label="Loading members"
      />
      <BapsSpinner brand="sampark" ariaLabel="Loading members" />
      <BapsSkeleton shape="circle" size="3rem" brand="sampark" />
      <BapsIconField>
        <BapsInputIcon icon="search-2" />
        <BapsInputText aria-label="Search members" />
      </BapsIconField>
      <BapsTextarea
        aria-label="Member notes"
        rows={4}
        defaultValue="Follow up after sabha."
      />
      <BapsMessage severity="info" variant="simple" brand="sampark">
        Server-rendered guidance.
      </BapsMessage>
      <BapsCheckbox aria-label="Select all" indeterminate brand="sampark" />
      <BapsRadio
        id="server-scope"
        name="server-scope"
        value="all"
        label="All"
        brand="sampark"
      />
      <BapsToggleSwitch
        id="server-notifications"
        label="Notifications"
        brand="sampark"
        defaultChecked
      />
      <BapsInputGroup prefix="max" suffix="day/s" brand="sampark">
        <BapsInputText type="number" aria-label="Maximum days" />
      </BapsInputGroup>
      <BapsSegmented
        ariaLabel="Frequency"
        options={['Once', 'Repeat', 'Ad-hoc']}
        defaultValue="Once"
        brand="sampark"
      />
    </>
  );
}

'use client';

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
  BapsInputGroup,
  BapsInputText,
  BapsIndicator,
  BapsLink,
  BapsMessage,
  BapsOverlayBadge,
  BapsProgressBar,
  BapsRadio,
  BapsSelect,
  BapsMultiSelect,
  BapsListbox,
  BapsTreeSelect,
  BapsDatepicker,
  BapsSlider,
  BapsChip,
  BapsUsersDropdown,
  BapsFileUpload,
  BapsPagination,
  BapsSegmented,
  BapsSkeleton,
  BapsSpinner,
  BapsTag,
  BapsTextarea,
  BapsToggleSwitch,
} from '@org/ui-kit-react';

export default function ClientPage() {
  return (
    <main>
      <BapsIcon name="notification" label="Notifications" />
      <BapsButton
        label="Continue"
        icon="arrow-right"
        iconPosition="right"
        onClick={() => undefined}
      />
      <BapsLink href="/details" onClick={() => undefined}>
        Details
      </BapsLink>
      <BapsAvatarGroup aria-label="Members">
        <BapsAvatar label="GP" statusDot />
        <BapsAvatar label="AP" iconBadge />
      </BapsAvatarGroup>
      <BapsBadge value={8} severity="danger" />
      <BapsOverlayBadge value={4} badgeAriaLabel="4 notifications">
        <BapsButton icon="notification" aria-label="Notifications" />
      </BapsOverlayBadge>
      <BapsIndicator severity="success" aria-label="Online" />
      <BapsTag
        value="Member"
        action
        actionLabel="Open member"
        onAction={() => undefined}
      />
      <BapsAlert closable onClose={() => undefined}>
        Changes saved.
      </BapsAlert>
      <BapsCard interactive onClick={() => undefined} title="Member">
        Open member details
      </BapsCard>
      <BapsDivider />
      <BapsProgressBar value={72} showValue aria-label="Upload progress" />
      <BapsSpinner value={72} aria-label="Upload progress" />
      <BapsSkeleton width="80%" animation="none" />
      <BapsFloatLabel>
        <BapsInputText id="client-email" onChange={() => undefined} />
        <label htmlFor="client-email">Email</label>
      </BapsFloatLabel>
      <BapsTextarea
        aria-label="Member notes"
        rows={4}
        autoResize
        onChange={() => undefined}
      />
      <BapsMessage severity="success" variant="simple">
        Client-side changes saved.
      </BapsMessage>
      <BapsCheckbox
        id="client-active"
        label="Active"
        onChange={() => undefined}
      />
      <BapsRadio
        id="client-scope"
        name="client-scope"
        value="all"
        label="All"
        onChange={() => undefined}
      />
      <BapsToggleSwitch
        id="client-notifications"
        label="Notifications"
        onChange={() => undefined}
      />
      <BapsInputGroup prefix="min" suffix="day/s">
        <BapsInputText type="number" aria-label="Minimum days" />
      </BapsInputGroup>
      <BapsSegmented
        ariaLabel="Frequency"
        options={['Once', 'Repeat', 'Ad-hoc']}
        defaultValue="Once"
        onValueChange={() => undefined}
      />
      <BapsSelect
        ariaLabel="City"
        options={[
          { label: 'Ahmedabad', value: 'amd' },
          { label: 'London', value: 'ldn' },
        ]}
        onValueChange={() => undefined}
      />
      <BapsMultiSelect
        ariaLabel="Cities"
        options={[
          { label: 'Ahmedabad', value: 'amd' },
          { label: 'London', value: 'ldn' },
        ]}
        display="chip"
        onValueChange={() => undefined}
      />
      <BapsListbox
        ariaLabel="Centres"
        multiple
        checkbox
        options={[
          { label: 'Ahmedabad', value: 'amd' },
          { label: 'London', value: 'ldn' },
        ]}
        onValueChange={() => undefined}
      />
      <BapsTreeSelect
        ariaLabel="Locations"
        selectionMode="checkbox"
        options={[
          {
            key: 'in',
            label: 'India',
            children: [{ key: 'in-amd', label: 'Ahmedabad' }],
          },
        ]}
        onValueChange={() => undefined}
      />
      <BapsDatepicker
        ariaLabel="Visit date"
        showIcon
        onValueChange={() => undefined}
      />
      <BapsSlider
        ariaLabel="Attendance target"
        defaultValue={50}
        onValueChange={() => undefined}
      />
      <BapsChip label="Volunteer" removable onRemove={() => undefined} />
      <BapsUsersDropdown
        ariaLabel="Member"
        users={[
          { value: 'asha', title: 'Asha Patel', avatarLabel: 'AP' },
          { value: 'ravi', title: 'Ravi Shah', avatarLabel: 'RS' },
        ]}
        onValueChange={() => undefined}
      />
      <BapsFileUpload
        ariaLabel="Upload member photo"
        accept="image/*"
        onFilesSelected={() => undefined}
      />
      <BapsPagination
        totalRecords={250}
        defaultRows={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
        showCurrentPageReport
        showJumpToPage
        onPageChange={() => undefined}
      />
    </main>
  );
}

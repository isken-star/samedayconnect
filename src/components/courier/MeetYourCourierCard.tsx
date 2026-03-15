import type { Courier } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import {
  COURIER_IMAGE_FALLBACKS,
  resolveCourierImage,
} from "@/src/lib/courier/getActiveCourier";
import { getCourierPayloadKg, getCourierVanLabel } from "@/src/lib/courier/payload";

interface MeetYourCourierCardProps {
  courier: Courier;
  compact?: boolean;
  contactHref?: string;
  aboutHref?: string;
  className?: string;
  profileOverrides?: {
    displayName?: string;
    businessName?: string;
    bio?: string;
    vanPhotoUrl?: string;
    profilePhotoUrl?: string;
  };
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "CC";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function MeetYourCourierCard({
  courier,
  compact = false,
  contactHref,
  aboutHref,
  className = "",
  profileOverrides,
}: MeetYourCourierCardProps) {
  const payloadKg = courier.vanPayloadKg || getCourierPayloadKg(courier.vanType);
  const vanLabel = getCourierVanLabel(courier.vanType);
  const displayName = profileOverrides?.displayName ?? (courier.displayName || courier.businessName);
  const displayBusinessName = profileOverrides?.businessName ?? courier.businessName;
  const profilePhotoUrl = profileOverrides?.profilePhotoUrl ?? courier.profilePhotoUrl;
  const displayBio = profileOverrides?.bio ?? courier.bio;
  const profileSrc = resolveCourierImage(profilePhotoUrl, COURIER_IMAGE_FALLBACKS.profile);
  const hasProfilePhoto = Boolean(profilePhotoUrl);

  return (
    <article className={`glass-card rounded-2xl p-5 shadow-[0_0_28px_rgba(168,85,247,0.12)] ${className}`.trim()}>
      <div className="flex items-start gap-3">
        {hasProfilePhoto ? (
          <Image
            src={profileSrc}
            alt={`${displayName} profile`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-[var(--border-subtle)] object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-lg font-semibold text-[var(--text-main)]">
            {getInitials(displayName)}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-lg font-semibold text-[var(--text-main)]">{displayName}</p>
          <p className="text-sm text-[var(--text-subtle)]">{displayBusinessName}</p>
          <span className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--accent-soft)]">
            Part of Same Day Connect
          </span>
        </div>
      </div>

      {!compact && displayBio ? (
        <p className="mt-4 text-sm text-[var(--text-subtle)]">{displayBio}</p>
      ) : null}

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--text-subtle)]">Your vehicle</p>
      <p className="text-sm text-[var(--text-main)]">{vanLabel} Van • up to {payloadKg}kg payload</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--text-main)]">
          Goods in Transit
        </span>
        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--text-main)]">
          Public Liability
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--text-subtle)]">
        Insurance details are provided by the courier. Proof may be requested for community
        standards.
      </p>

      {courier.baseArea ? (
        <p className="mt-3 text-sm text-[var(--text-subtle)]">Service area: {courier.baseArea}</p>
      ) : null}

      {contactHref || aboutHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {contactHref ? (
            <Link
              href={contactHref}
              className="secondary-button rounded-xl px-4 py-2 text-sm font-medium"
            >
              Contact
            </Link>
          ) : null}
          {aboutHref ? (
            <Link
              href={aboutHref}
              className="secondary-button rounded-xl px-4 py-2 text-sm font-medium"
            >
              About
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Calendar, Camera, IdCard, ImageIcon, Loader2, Mail, Save, Shield, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_CONFIG } from "@/types/auth";
import { useAuthStore, userInitials } from "@/stores/useAuthStore";
import { prepareImageUpload } from "@/lib/client-image";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#1e1e1e] bg-[#101010] px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#272727] bg-[#171717]">
        <Icon className="h-4 w-4 text-[#666]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-[#444]">{label}</p>
        <p className="truncate text-[13px] text-[#aaa]">{value}</p>
      </div>
    </div>
  );
}

function ProfileContent() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [bannerImage, setBannerImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setOrganization(user.organization ?? "");
    setAvatar(user.avatar);
    setBannerImage(user.bannerImage);
  }, [user]);

  const roleConfig = user ? ROLE_CONFIG[user.role] : null;
  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      firstName.trim() !== user.firstName ||
      lastName.trim() !== user.lastName ||
      organization.trim() !== (user.organization ?? "") ||
      (avatar ?? "") !== (user.avatar ?? "") ||
      (bannerImage ?? "") !== (user.bannerImage ?? "")
    );
  }, [avatar, bannerImage, firstName, lastName, organization, user]);

  if (!user || !roleConfig) return null;

  const handleImagePick = async (
    file: File | undefined,
    kind: "profile picture" | "banner",
    onPrepared: (imageUrl: string) => void,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} is not an image`);
      return;
    }

    const promise = prepareImageUpload(file);
    toast.promise(promise, {
      loading: `Preparing ${kind}...`,
      success: `${kind[0].toUpperCase()}${kind.slice(1)} ready to save`,
      error: (err) => err instanceof Error ? err.message : `Failed to prepare ${kind}`,
    });

    const prepared = await promise.catch(() => null);
    if (prepared) onPrepared(prepared.imageUrl);
  };

  const removeImage = (kind: "profile picture" | "banner", onRemove: () => void) => {
    onRemove();
    toast.info(`${kind[0].toUpperCase()}${kind.slice(1)} removed. Save to apply.`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    const saveProfile = async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organization: organization.trim() || undefined,
          avatar,
          bannerImage,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update profile");
      return data.user;
    };

    setSaving(true);
    const promise = saveProfile();
    toast.promise(promise, {
      loading: "Saving profile...",
      success: "Profile updated",
      error: (err) => err instanceof Error ? err.message : "Failed to update profile",
    });

    try {
      const updated = await promise;
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        organization: updated.organization ?? undefined,
        avatar: updated.image ?? undefined,
        bannerImage: updated.bannerImage ?? undefined,
        lastLoginAt: new Date(updated.updatedAt).toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0d0d0d] text-white">
      <DashboardNav />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#111]">
          <div className="relative h-50 bg-[#141414]">
            {bannerImage ? (
              <img src={bannerImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#111,#1b1b1b_45%,#101010)]">
                <ImageIcon className="h-6 w-6 text-[#333]" />
              </div>
            )}
            <div className="absolute right-4 top-4 flex gap-2">
              <Button type="button" size="sm" variant="secondary" className="h-8 gap-2" onClick={() => bannerInputRef.current?.click()}>
                <ImageIcon className="h-3.5 w-3.5" />
                Banner
              </Button>
              {bannerImage && (
                <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => removeImage("banner", () => setBannerImage(undefined))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-end gap-4 px-5 pb-5">
            <div className="-mt-10">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#111] bg-[#171717]">
                {avatar ? (
                  <img src={avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-[#777]">{userInitials(user)}</span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-4">
              <h1 className="text-xl font-semibold text-white">Profile</h1>
              <p className="mt-1 text-[13px] text-[#555]">
                Manage your account identity and workspace details.
              </p>
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button type="button" size="sm" variant="outline" className="gap-2 border-[#2a2a2a]" onClick={() => avatarInputRef.current?.click()}>
                <Camera className="h-3.5 w-3.5" />
                Picture
              </Button>
              {avatar && (
                <Button type="button" size="icon" variant="outline" className="h-8 w-8 border-[#2a2a2a]" onClick={() => removeImage("profile picture", () => setAvatar(undefined))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImagePick(event.target.files?.[0], "profile picture", setAvatar)}
          />
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImagePick(event.target.files?.[0], "banner", setBannerImage)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Account Details</h2>
                <p className="mt-1 text-[12px] text-[#555]">Changes are saved to your Synthmark account.</p>
              </div>
              <Button type="submit" size="sm" disabled={!hasChanges || saving} className="gap-2">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-[#888]">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="h-9 border-[#2a2a2a] bg-[#0d0d0d]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-[#888]">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="h-9 border-[#2a2a2a] bg-[#0d0d0d]"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="organization" className="text-xs text-[#888]">Organization</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  placeholder="Personal workspace"
                  className="h-9 border-[#2a2a2a] bg-[#0d0d0d]"
                />
              </div>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#272727] bg-[#171717]">
                  <Shield className="h-4 w-4" style={{ color: roleConfig.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{roleConfig.label}</p>
                  <p className="text-[12px] text-[#555]">{roleConfig.tagline}</p>
                </div>
              </div>
              <p className="text-[12px] leading-5 text-[#666]">{roleConfig.description}</p>
            </div>

            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow icon={UserRound} label="Name" value={`${user.firstName} ${user.lastName}`} />
            <DetailRow icon={IdCard} label="User ID" value={user.id} />
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
            <DetailRow icon={BadgeCheck} label="Workspace" value={user.organization ?? "Personal workspace"} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

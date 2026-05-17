"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Shield,
  Briefcase,
  PenTool,
  CheckSquare,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROLE_CONFIG, UserRole } from "@/types/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  admin: Shield,
  project_manager: Briefcase,
  annotator: PenTool,
  reviewer: CheckSquare,
  viewer: Eye,
};

const ROLES: UserRole[] = [
  "admin",
  "project_manager",
  "annotator",
  "reviewer",
  "viewer",
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[11px] text-muted-foreground mr-1">Step {current} of 2</span>
      {([1, 2] as const).map((n) => (
        <div
          key={n}
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{ backgroundColor: n === current ? "var(--primary)" : "var(--muted)" }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Role selection ───────────────────────────────────────────────────

function StepRole({
  selected,
  onSelect,
  onContinue,
}: {
  selected: UserRole | null;
  onSelect: (r: UserRole) => void;
  onContinue: () => void;
}) {
  const selectedCfg = selected ? ROLE_CONFIG[selected] : null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-[400px] mx-auto py-10 px-2">
      <StepDots current={1} />

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">
          Choose your role
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select how you&apos;ll use Synthmark. You can change this later.
        </p>
      </div>

      {/* Role cards — vertical list */}
      <div className="flex flex-col gap-2">
        {ROLES.map((role) => {
          const cfg = ROLE_CONFIG[role];
          const Icon = ROLE_ICONS[role];
          const isSelected = selected === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors cursor-pointer"
              style={{
                border: `1px solid ${isSelected ? "var(--border)" : "var(--border)"}`,
                backgroundColor: isSelected ? "var(--muted)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--muted)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--border)";
              }}
            >
              {/* Icon */}
              <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                <Icon
                  className="w-[15px] h-[15px]"
                  style={{
                    color: isSelected ? "var(--primary)" : "rgba(255,255,255,0.3)",
                  }}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-foreground leading-tight">
                  {cfg.label}
                </p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-tight">
                  {cfg.tagline}
                </p>
              </div>

              {/* Checkmark when selected */}
              {isSelected && (
                <span className="text-xs text-foreground shrink-0 ml-1">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Brief description for selected role */}
      {selectedCfg && (
        <p className="text-[12px] text-muted-foreground leading-relaxed -mt-1">
          {selectedCfg.description}
        </p>
      )}

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className="h-10 w-full font-semibold rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        onMouseEnter={(e) => {
          if (selected)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--primary)";
        }}
        onMouseLeave={(e) => {
          if (selected)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--primary)";
        }}
      >
        Continue
      </button>

      {/* Footer */}
      <p className="text-center text-[12px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="text-foreground hover:text-foreground transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Step 2: Account details ──────────────────────────────────────────────────

function StepAccount({
  selectedRole,
  onBack,
}: {
  selectedRole: UserRole;
  onBack: () => void;
}) {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [org, setOrg] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cfg = ROLE_CONFIG[selectedRole];

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    if (!terms) errs.terms = "You must accept the terms to continue.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function clearField(field: string) {
    setFieldErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
    clearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const promise = signUp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
      organization: org.trim() || undefined,
    }).then((ok) => {
      if (!ok) {
        const message = useAuthStore.getState().error ?? "Sign up failed";
        throw new Error(message);
      }
      return firstName.trim();
    });

    toast.promise(promise, {
      loading: "Creating account...",
      success: (name) => `Welcome to Synthmark, ${name}!`,
      error: (err) => err instanceof Error ? err.message : "Sign up failed",
    });

    const ok = await promise.then(() => true).catch(() => false);
    if (ok) {
      router.push("/dashboard");
    }
  }

  // Shared input className
  const inputCls =
    "bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:border-border focus-visible:ring-0 rounded-lg h-10";

  return (
    <div className="flex flex-col gap-5 w-full max-w-[400px] mx-auto py-10 px-2">
      <StepDots current={2} />

      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-muted-foreground hover:text-muted-foreground transition-colors mb-3"
        >
          ← Back
        </button>
        <div className="flex items-baseline gap-2">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">
            Create your account
          </h1>
          <span className="text-[11px] text-muted-foreground">{cfg.label}</span>
        </div>
      </div>

      {/* Store-level error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/40 px-3.5 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="firstName"
              className="text-[13px] text-muted-foreground font-normal"
            >
              First name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearField("firstName");
              }}
              placeholder="Alex"
              aria-invalid={!!fieldErrors.firstName}
              className={inputCls}
            />
            {fieldErrors.firstName && (
              <p className="text-[11px] text-red-400">
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="lastName"
              className="text-[13px] text-muted-foreground font-normal"
            >
              Last name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearField("lastName");
              }}
              placeholder="Chen"
              aria-invalid={!!fieldErrors.lastName}
              className={inputCls}
            />
            {fieldErrors.lastName && (
              <p className="text-[11px] text-red-400">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-[13px] text-muted-foreground font-normal"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearField("email");
            }}
            placeholder="you@company.com"
            aria-invalid={!!fieldErrors.email}
            className={inputCls}
          />
          {fieldErrors.email && (
            <p className="text-[11px] text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            className="text-[13px] text-muted-foreground font-normal"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearField("password");
              }}
              placeholder="••••••••"
              aria-invalid={!!fieldErrors.password}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-[11px] text-red-400">{fieldErrors.password}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Min. 8 characters</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="confirm"
            className="text-[13px] text-muted-foreground font-normal"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConf ? "text" : "password"}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                clearField("confirm");
              }}
              placeholder="••••••••"
              aria-invalid={!!fieldErrors.confirm}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConf((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              aria-label={showConf ? "Hide password" : "Show password"}
            >
              {showConf ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.confirm && (
            <p className="text-[11px] text-red-400">{fieldErrors.confirm}</p>
          )}
        </div>

        {/* Organization (optional) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org" className="text-[13px] text-muted-foreground font-normal">
            Organization <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="org"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Company or team name"
            className={inputCls}
          />
        </div>

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(v) => {
                setTerms(v === true);
                clearField("terms");
              }}
              className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
            />
            <Label
              htmlFor="terms"
              className="text-[13px] text-muted-foreground leading-relaxed cursor-pointer font-normal"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
          {fieldErrors.terms && (
            <p className="text-[11px] text-red-400 ml-6">{fieldErrors.terms}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          onMouseEnter={(e) => {
            if (!isLoading)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--primary)";
          }}
          onMouseLeave={(e) => {
            if (!isLoading)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--primary)";
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-[12px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="text-foreground hover:text-foreground transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, checkSession } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full px-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      {step === 1 ? (
        <StepRole
          selected={selectedRole}
          onSelect={setSelectedRole}
          onContinue={() => {
            if (selectedRole) setStep(2);
          }}
        />
      ) : (
        <StepAccount selectedRole={selectedRole!} onBack={() => setStep(1)} />
      )}
    </div>
  );
}

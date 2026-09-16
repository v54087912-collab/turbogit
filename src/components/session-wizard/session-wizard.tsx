"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { sendCode, signIn, check2FA } from "@/lib/telegram";
import { toast } from "sonner";

interface SessionWizardProps {
  open: boolean;
  onClose: () => void;
}

type Step = "phone" | "otp" | "2fa" | "processing";

export default function SessionWizard({ open, onClose }: SessionWizardProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [error, setError] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const { masterPassword, savePermanentSession } = useAuthStore();

  const reset = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setTwoFAPassword("");
    setError("");
    setPhoneCodeHash("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getCreds = async () => {
    const { getEncryptedConfig } = await import("@/lib/indexed-db");
    const { decrypt } = await import("@/lib/crypto");
    const encApiId = await getEncryptedConfig("tg_api_id");
    const encApiHash = await getEncryptedConfig("tg_api_hash");
    if (!encApiId || !encApiHash || !masterPassword) {
      throw new Error("Telegram API credentials not configured");
    }
    const apiId = parseInt(await decrypt(encApiId, masterPassword));
    const apiHash = await decrypt(encApiHash, masterPassword);
    return { apiId, apiHash };
  };

  const handleSendCode = async () => {
    setError("");
    setStep("processing");

    try {
      const { apiId, apiHash } = await getCreds();
      const result = await sendCode(apiId, apiHash, phone);
      setPhoneCodeHash(result.phoneCodeHash);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
      setStep("phone");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setStep("processing");

    try {
      const { apiId, apiHash } = await getCreds();
      const result = await signIn(apiId, apiHash, phone, phoneCodeHash, otp);

      if (result.twoFactorRequired) {
        setStep("2fa");
        return;
      }

      if (result.sessionString) {
        await savePermanentSession(result.sessionString);
        toast.success("Permanent Session Established!");
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
      setStep("otp");
    }
  };

  const handleVerify2FA = async () => {
    setError("");
    setStep("processing");

    try {
      const { apiId, apiHash } = await getCreds();
      const result = await check2FA(
        apiId,
        apiHash,
        phone,
        phoneCodeHash,
        otp,
        twoFAPassword
      );

      if (result.sessionString) {
        await savePermanentSession(result.sessionString);
        toast.success("Permanent Session Established!");
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify 2FA");
      setStep("2fa");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Create Permanent Session
      </h2>

      {step === "phone" && (
        <div className="space-y-4">
          <Input
            label="Enter Phone Number (with country code)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleSendCode} disabled={!phone}>
              Send OTP
            </Button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <Input
            label="Enter OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="12345"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleVerifyOtp} disabled={!otp}>
              Verify OTP
            </Button>
          </div>
        </div>
      )}

      {step === "2fa" && (
        <div className="space-y-4">
          <div className="bg-surface-hover border border-border rounded-[var(--radius-md)] p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Two-Step Verification Required
            </h3>
            <p className="text-xs text-text-muted">
              Your account has two-factor authentication enabled. Please enter
              your 2FA password below.
            </p>
          </div>
          <Input
            label="Enter your 2FA Password"
            type="password"
            value={twoFAPassword}
            onChange={(e) => setTwoFAPassword(e.target.value)}
            placeholder="Your 2FA password"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleVerify2FA} disabled={!twoFAPassword}>
              Submit 2FA &amp; Create Session
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-text-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-text-muted">Processing...</p>
        </div>
      )}
    </Modal>
  );
}

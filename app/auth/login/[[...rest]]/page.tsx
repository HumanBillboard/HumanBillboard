import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#171717] p-6">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "border-[#D9D9D9]/20 bg-[#171717] shadow-xl",
            headerTitle: "text-2xl text-[#D9D9D9]",
            headerSubtitle: "text-[#D9D9D9]/70",
            socialButtonsBlockButton: "border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] hover:bg-[#D9D9D9]/10",
            formFieldLabel: "text-[#D9D9D9]",
            formFieldInput: "border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50",
            formButtonPrimary: "bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90",
            footerActionLink: "text-[#8BFF61] hover:text-[#8BFF61]/80",
            identityPreviewText: "text-[#D9D9D9]",
            identityPreviewEditButton: "text-[#8BFF61]",
            formResendCodeLink: "text-[#8BFF61]",
            otpCodeFieldInput: "border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9]",
          },
        }}
        signUpUrl="/auth/signup"
        forceRedirectUrl="/auth/redirect"
      />
    </div>
  )
}

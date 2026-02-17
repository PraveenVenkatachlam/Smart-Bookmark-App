import { AuthButton } from "@/components/AuthButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-xl">
        {/* Logo / Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            🔖 Smart Bookmarks
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Save links. Stay organized. Real-time sync.
          </p>
        </div>

        {/* Google OAuth Button */}
        <AuthButton />
      </div>
    </div>
  );
}
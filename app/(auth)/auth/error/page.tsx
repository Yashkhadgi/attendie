export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-slate-500">Sign in</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
        Sign in could not be completed.
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Please return to EkLink and try opening Attendie again.
      </p>
    </main>
  );
}

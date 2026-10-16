export default function NoAccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-slate-500">No access</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
        Attendie is not available for this EkLink role.
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Please contact the Attendie owner if you believe this is a mistake.
      </p>
    </main>
  );
}

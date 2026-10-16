const eklinkPortalUrl = process.env.EKLINK_URL || "https://ek-link-nine.vercel.app";

export default function SignedOutPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-slate-500">Signed out</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
        You were signed out of Attendie only.
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Your EkLink session may still be active.
      </p>
      <a
        href={eklinkPortalUrl}
        className="mt-6 inline-flex w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Go to EkLink
      </a>
    </main>
  );
}

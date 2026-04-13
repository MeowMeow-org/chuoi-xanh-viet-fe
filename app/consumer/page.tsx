import Link from "next/link";

export default function ConsumerPage() {
    return (
        <main className="min-h-screen bg-[hsl(120,20%,98%)] px-4 py-10 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
                        Consumer Workspace
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Consumer Dashboard (placeholder)</h1>
                    <p className="mt-3 text-sm text-[hsl(150,5%,45%)]">
                        Trang tam de test navigate theo role consumer sau khi login thanh cong.
                    </p>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5">
                        <p className="text-sm text-[hsl(150,5%,45%)]">Don hang gan day</p>
                        <p className="mt-2 text-2xl font-bold">3</p>
                    </article>
                    <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5">
                        <p className="text-sm text-[hsl(150,5%,45%)]">San pham da luu</p>
                        <p className="mt-2 text-2xl font-bold">12</p>
                    </article>
                    <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5">
                        <p className="text-sm text-[hsl(150,5%,45%)]">Thong bao</p>
                        <p className="mt-2 text-2xl font-bold">2</p>
                    </article>
                </section>

                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-lg bg-[hsl(142,71%,45%)] px-4 py-2 text-sm font-semibold text-white"
                    >
                        Ve trang chu
                    </Link>
                </div>
            </div>
        </main>
    );
}

// app/doctors/loading.tsx
// /doctors reads searchParams (see the note at the top of page.tsx), which makes it a
// dynamic route rather than a prerendered one. Next renders this automatically while
// that request is in flight, instead of a blank tab on a slow connection.
//
// Shaped like the page it stands in for — a search bar, then one grouped section of
// card-shaped blocks — so the layout does not jump once real results arrive. Pulses
// with Tailwind's animate-pulse, which is already covered by the sitewide
// prefers-reduced-motion guard in globals.css.
//
// Every file in a route segment shares one runtime — page.tsx declares 'edge', so this
// one must match it or Next's dev bundler mismatches the two and fails to compile.
export const runtime = 'edge'

export default function DoctorsLoading() {
  return (
    <section className="py-section">
      <div className="mx-auto w-full max-w-container px-gutter">
        <div className="h-4 w-24 animate-pulse rounded bg-ink-100" />
        <div className="mt-3 h-10 w-64 animate-pulse rounded bg-ink-100" />
        <div className="mt-4 h-[3px] w-20 animate-pulse rounded-full bg-ink-100" />

        <div className="mt-8 h-12 max-w-2xl animate-pulse rounded-full bg-ink-100" />

        <div className="mt-12">
          <div className="h-7 w-48 animate-pulse rounded bg-ink-100" />
          <ul className="mt-6 flex flex-col gap-5">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-32 animate-pulse rounded-tl-3xl rounded-br-3xl
                           rounded-tr-md rounded-bl-md bg-ink-100"
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

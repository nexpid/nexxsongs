import Link from "next/link";

export default function Unknown({
  label,
  subLabel,
}: {
  label: string;
  subLabel?: string;
}) {
  return (
    <>
      <h1 className="font-bold text-5xl pb-4">{label}</h1>
      {subLabel && <h2 className="opacity-75 text-2xl pb-4">{subLabel}</h2>}
      <Link href="/" className="text-sky-600 font-bold text-2xl">
        Go back
      </Link>
    </>
  );
}

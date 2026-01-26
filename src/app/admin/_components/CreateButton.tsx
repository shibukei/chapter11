import Link from "next/link";

type CreateButtonProps = {
  href: string;
  label?: string;
};

export default function CreateButton({
  href,
  label = "新規作成",
}: CreateButtonProps) {
  return (
    <Link
      href={href}
      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 font-bold text-base"
    >
      {label}
    </Link>
  );
}
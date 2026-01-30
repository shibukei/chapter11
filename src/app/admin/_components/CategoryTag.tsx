export default function CategoryTag({ name }: { name: string }) {
  return (
    <span className="text-xs border border-blue-500 text-blue-500 rounded px-2 py-1 mr-2">
      {name}
    </span>
  );
}
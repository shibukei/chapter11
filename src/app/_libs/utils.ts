export const extractImageKey = (key: string): string => {
  const prefix =
    "https://ednabakeqybwvveckomi.supabase.co/storage/v1/object/public/post_thumbnail/";
  if (key.startsWith(prefix)) {
    return key.slice(prefix.length);
  }
  return key;
}
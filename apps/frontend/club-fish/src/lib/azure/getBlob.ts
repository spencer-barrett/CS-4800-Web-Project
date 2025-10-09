export function azurePublicUrl(name: string) {
  const acct = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT!;
  const container = process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER!;
  console.log(`https://${acct}.blob.core.windows.net/${container}/${encodeURIComponent(name)}`);
  return `https://${acct}.blob.core.windows.net/${container}/${encodeURIComponent(name)}`;
}
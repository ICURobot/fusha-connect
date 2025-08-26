export function createPageUrl(pageName: string): string {
  // Convert page name to kebab-case for URL
  const kebabCase = pageName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  return `/${kebabCase}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

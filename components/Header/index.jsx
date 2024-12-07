import Link from 'next/link';

const pages = [
  { href: '/', title: 'Home' }
];

export function Header() {
  return <nav>
    <ul>
      {pages.map(({ href, title }) =>
        <li key={href}>
          <Link href={href}> {title} </Link>
        </li>)}
    </ul>
  </nav>;
}
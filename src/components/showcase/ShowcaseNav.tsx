import { Link } from "react-router-dom";

type Props = {
  rightLink: { to: string; label: string };
};

const ShowcaseNav = ({ rightLink }: Props) => {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-serif-display text-xl tracking-tight">
          Wavelody
        </Link>
        <Link
          to={rightLink.to}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {rightLink.label}
        </Link>
      </nav>
    </header>
  );
};

export default ShowcaseNav;

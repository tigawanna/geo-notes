import { useViewer } from "@/data-access-layer/auth/viewer";
import { Link } from "@tanstack/react-router";

const buttonClass =
  "rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-content transition-transform hover:scale-[1.03]";

export default function LandingDashboardLink() {
  const { viewer } = useViewer();

  if (viewer?.user) {
    return (
      <Link to="/dashboard" className={buttonClass}>
        Dashboard
      </Link>
    );
  }

  return (
    <Link to="/auth" search={{ returnTo: "/dashboard" }} className={buttonClass}>
      Get started
    </Link>
  );
}

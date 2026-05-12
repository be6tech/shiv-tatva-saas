import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { EmployeeShowcase } from "@/components/marketing/employee-showcase";
import { marketingPageRoot } from "@/components/marketing/marketing-styles";

export const metadata = {
  title: "Employee details | Shiv Tatva Solutions",
  description:
    "Meet the professionals driving innovation—public team directory, skills, and profiles at Shiv Tatva Solutions Pvt Ltd.",
};

export default function EmployeeDetailsPage() {
  return (
    <div className={marketingPageRoot}>
      <Navbar appearance="landing" />
      <main className="flex-1">
        <EmployeeShowcase />
      </main>
      <Footer variant="dark" />
    </div>
  );
}

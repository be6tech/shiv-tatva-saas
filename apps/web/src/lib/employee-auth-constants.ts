export const EMPLOYEE_ID_DEFAULT = "BE19990022";
export const EMPLOYEE_EMAIL_DEFAULT = "durgaprasad@be6technologies.in";

/** All roster logins use initial password `demo` until changed via forgot-password. */
export const EMPLOYEE_SEED_PASSWORD_HASH =
  "f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97";

export const EMPLOYEE_ROSTER = [
  { id: "BE19990002", email: "kumarhrmbe6@gmail.com" },
  { id: "BE19990003", email: "sakichennakesavulu5@gmail.com" },
  { id: "BE19990005", email: "uma@be6technologies.in" },
  { id: "BE19990006", email: "venkatasai@be6technologies.in" },
  { id: "BE19990012", email: "naveench9997@gmail.com" },
  { id: "BE19990013", email: "faizanali@be6technologies.in" },
  { id: "BE19990015", email: "pavanihr@be6technologies.in" },
  { id: "BE19990016", email: "boddapatisumasuma@gmail.com" },
  { id: "BE19990017", email: "kumarswamy@be6technologies.in" },
  { id: "BE19990021", email: "phaneendra@be6technologies.in" },
  { id: "BE19990022", email: "durgaprasad@be6technologies.in" },
  { id: "BE19990023", email: "raghuramkedasu2002@gmail.com" },
  { id: "BE19990027", email: "nagaraju@be6technologies.in" },
  { id: "BE19990028", email: "sreekanthp98614@gmail.com" },
  { id: "BE19990030", email: "ndrnimmagadda@gmail.com" },
  { id: "BE19990031", email: "lavanyabypureddy61@gmail.com" },
  { id: "BE19990033", email: "dileepkumarg557@gmail.com" },
] as const;

export function findRosterEmployee(identifier: string) {
  const value = identifier.trim();
  return (
    EMPLOYEE_ROSTER.find(
      (e) =>
        e.id.toUpperCase() === value.toUpperCase() ||
        e.email.toLowerCase() === value.toLowerCase()
    ) ?? null
  );
}

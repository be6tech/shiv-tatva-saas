/** All roster logins use initial password `demo` until changed via forgot-password. */
export const EMPLOYEE_SEED_PASSWORD_HASH =
  "f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97";

export const EMPLOYEE_ROSTER = [
  { id: "STS26HRM002", email: "mighttians97@gmail.com" },
  { id: "STS26ASE003", email: "sakichennakesavulu5@gmail.com" },
  { id: "STS26ASE004", email: "karedlaprasad13@gmail.com" },
  { id: "STS26ASE005", email: "mareedukumarswamy@gmail.com" },
  { id: "STS26ASE006", email: "ndrnimagadda@gmail.com" },
  { id: "STS26ASE007", email: "raghuramkedasu2002@gmail.com" },
  { id: "STS26BDE008", email: "naveench9997@gmail.com" },
  { id: "STS26BDE009", email: "sreekanthp98614@gmail.com" },
  { id: "STS26BDE010", email: "boddapatisumasuma@gmail.com" },
  { id: "STS26BDE011", email: "lavanyabypureddy61@gmail.com" },
  { id: "STS26ASE012", email: "sunilkumarmelapu418@gmail.com" },
  { id: "STS26ASE013", email: "bhaskark874@gmail.com" },
  { id: "STS26ASE014", email: "dileepkumarg557@gmail.com" },
  { id: "STS26ASE015", email: "phaneendra@be6technologies.in" },
  { id: "STS26BOE016", email: "pallavigandrothu007@gmail.com" },
  { id: "STS26ASE017", email: "eluriprasanthi2016@gmail.com" },
  { id: "STS26ASE018", email: "ayyappareddychalla7@gmail.com" },
  { id: "STS26ASE019", email: "pushkarpushkarsai2288@gmail.com" },
  { id: "STS26ASE020", email: "rambabugorli1@gmail.com" },
  { id: "STS26BDE021", email: "gowrisudabattula836@gmail.com" },
  { id: "STS26ASE022", email: "varaprasadjujjuri@gmail.com" },
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

import AdminForm from "./components/AdminForm";

export default function Page() {
  /* @ts-expect-error Server Component */
  return <AdminForm />;
}

import { Redirect } from "wouter";

// The template's placeholder dashboard is superseded by /account and /admin.
export default function Dashboard() {
  return <Redirect to="/account" />;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from "@/utils/auth-helpers/settings";
import { createClient } from "@/utils/supabase/server";
import LoginCard from "@/components/Authentication/components/LoginCard";
import SignUpCard from "@/components/Authentication/components/SignUpCard";
import ForgotPasswordCard from "@/components/Authentication/components/ForgotPasswordCard";
import UpdatePasswordCard from "@/components/Authentication/components/UpdatePasswordCard";
import EmailCodeCard from "@/components/Authentication/components/EmailCodeCard";

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string; signuptype: string };
  searchParams: { disable_button: boolean; email: string; next: string; extension?: string };
}) {
  const { allowOauth } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  let viewProp: string;

  if (typeof params.id === "string" && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const cookieStore = cookies();
    const preferredSignInView =
      cookieStore.get("preferredSignInView")?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/${viewProp}?next=${searchParams.next}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if this is an extension authentication request
  const isExtensionAuth = searchParams.extension === "true";
  
  if (
    user &&
    !user.is_anonymous &&
    viewProp !== "update_password" &&
    viewProp !== "set_password"
  ) {
    // If this is an extension auth request and user is already logged in,
    // redirect to the extension-auth-success page instead of dashboard
    if (isExtensionAuth) {
      console.log("Extension auth - User already logged in, redirecting to success page");
      return redirect("/extension-auth-success");
    }
    // Otherwise, redirect to dashboard as usual
    return redirect("/dashboard");
  } else if (viewProp === "password_signin") {
    return redirect("/signin");
  } else if (
    !user &&
    (viewProp === "update_password" || viewProp === "set_password")
  ) {
    return redirect("/signin");
  }

  // Cards
  const cardConfig: Record<string, JSX.Element> = {
    signin: (
      <LoginCard
        redirectToURL={isExtensionAuth ? "/extension-auth-success" : searchParams.next}
        redirectMethod={redirectMethod}
        disableButton={searchParams.disable_button}
        searchParamsEmail={searchParams.email}
        allowOauth={allowOauth}
        /* Note: We'll handle the extension flow through the redirectURL */
      />
    ),
    signup: (
      <SignUpCard
        allowOauth={allowOauth}
        redirectToURL={searchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    forgot_password: (
      <ForgotPasswordCard
        disableButton={searchParams.disable_button}
        redirectToURL={searchParams.next}
      />
    ),
    update_password: (
      <UpdatePasswordCard
        type="update_password"
        redirectToURL={searchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    set_password: (
      <UpdatePasswordCard
        type="set_password"
        redirectToURL={searchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    email_code: (
      <EmailCodeCard
        redirectTo={searchParams.next}
        redirectMethod={redirectMethod}
        disableButton={searchParams.disable_button}
      />
    ),
  };

  const card = cardConfig[viewProp];
  if (!card) return redirect("/signin");
  return card;
}

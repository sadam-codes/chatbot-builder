import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

const AuthMain = () => {
  const [view, setView] = useState("login");

  return (
    <div className="">
      <div>
        {view === "signup" && <SignupForm setView={setView} />}
        {view === "login" && <LoginForm setView={setView} />}
        {view === "forgot" && <ForgotPasswordForm setView={setView} />}
      </div>
    </div>
  );
};

export default AuthMain;
